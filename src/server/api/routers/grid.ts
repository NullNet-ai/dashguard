import { headers } from 'next/headers';
import { z } from 'zod';

import { type ISortBy } from '~/components/platform/Grid/Category/type';
import {
  EOperator,
  type IAdvanceFilters,
  type IResponse,
} from '@dna-platform/common-orm';
import { EOrderDirection } from '@dna-platform/common-orm/build/enums/model';

import {
  type IPagination,
  type ISearchItem,
} from '~/components/platform/Grid/Search/types';
import { gridCacheId, type TReportDataType } from '~/lib/grid-cache-id';
import { SetIdTab, SetTab } from '~/lib/grid-default-tab';
import { getGridLink } from '~/lib/grid-get-link';
import { tabMenuId } from '~/lib/tab-menu-id';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { formatSorting } from '~/server/utils/formatSorting';
import ZodCreateEntity from '~/server/zodSchema/grid/createEntity';
import ZodGetFilters from '~/server/zodSchema/grid/getFilters';
import ZodItems from '~/server/zodSchema/grid/items';
import ZodSaveFilters from '~/server/zodSchema/grid/saveFilters';

import { pluralize } from '../../utils/pluralize';
import { EStatus, type IGridFilterBy, type ITabGrid } from '../types';

export const gridRouter = createTRPCRouter({
  createEntity: privateProcedure
    .input(ZodCreateEntity)
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.DRAFT,
            },
            pluck: ['id', 'code'],
          },
        })
        .execute()
        .catch((error) => {
          console.error('@Error Grid', error);
        });

      ctx?.redisClient
        .cacheData(
          `wizard_${input.entity}:${record?.data?.[0]?.id}`,
          JSON.stringify(1),
        )
        .then(() => {
          return 'Cached';
        })
        .catch((error) => {
          console.error('@Error Grid', error);
          return 'Error';
        });
      ctx?.redisClient
        .cacheData(
          `wizard_${input.entity}:${record?.data?.[0]?.code}`,
          JSON.stringify(1),
        )
        .then(() => {
          return 'Cached';
        })
        .catch((error) => {
          console.error('@Error Grid', error);
          return 'Error';
        });
      return record as IResponse<Record<string, any>>;
    }),
  defaultGridTab: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        application: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input?.application !== 'grid') return;
      const _tabMenuId = tabMenuId({
        _mainEntity: input?.entity || '',
        _application: input?.application || '',
        _id: ctx.session.account.contact.id,
      });

      const hasTabMenu = await ctx.redisClient.getCachedData(_tabMenuId);

      if (hasTabMenu) return hasTabMenu;
      if (input?.application === 'grid') {
        const setIdTab = SetIdTab(input.entity);
        ctx.redisClient.cacheData(
          getGridLink({
            mainEntity: input.entity,
          }),
          setIdTab,
        );
        ctx.redisClient.cacheData(_tabMenuId, setIdTab);
      }
    }),
  getCustomGridTabs: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        application: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const headerList = headers();
      const gridTabId = headerList.get('x-grid-tab-id') || '';
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');

      const contact_id = ctx.session.account.contact.id;
      const query = ctx.dnaClient.findAll({
        entity: 'grid_filter',
        token: ctx.token.value,
        query: {
          pluck: [
            'id',
            'name',
            'entity',
            'link',
            'is_current',
            'is_default',
            'columns',
            'groups',
            'sorts',
            'advance_filters',
            'default_sorts',
            'filter_groups',
            'group_advance_filters',
          ],
          advance_filters: [
            {
              type: 'criteria',
              field: 'contact_id',
              operator: EOperator.EQUAL,
              values: [contact_id],
            },
            {
              operator: EOperator.AND,
              type: 'operator',
              default: true,
            },
            {
              type: 'criteria',
              field: 'entity',
              operator: EOperator.EQUAL,
              values: [mainEntity!],
            },
          ] as IAdvanceFilters[],
        },
      });
      const { data: items } = await query.execute();
      // get data from redis cache and save the fetch data to redis
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });

      const gridTabFilterList = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      // Create a map to store unique tabs based on id
      const uniqueTabsMap = new Map();

      // Add existing tabs from cache to the map
      if (gridTabFilterList) {
        gridTabFilterList.forEach((tab) => {
          uniqueTabsMap.set(tab.id, tab);
        });
      }

      // Add new items, overwriting any existing entries with the same id
      items.forEach((item) => {
        uniqueTabsMap.set(item.id, {
          ...item,
          href: item.link,
          default_filter: item.advance_filters,
          current: false,
        });
      });

      // Convert map values back to array
      const merged_tabs = Array.from(uniqueTabsMap.values());

      await ctx.redisClient.cacheData(_tabMenuId, merged_tabs);

      return merged_tabs;
    }),

  items: privateProcedure
    // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        entity,
        sorting,
      } = input;
      // Calculate the number of items to skip based on the current page
      // Fetch the total count of users
      /**
       *
       * @Logic to get filters from the grid tab
       *
       */
      const join_type =
        input?.entity === 'contact'
          ? 'self'
          : ('left' as 'self' | 'left' | 'right' | 'inner');

      const created_by_join = {
        type: join_type,
        field_relation:
          join_type === 'self'
            ? {
                to: {
                  entity,
                  field: 'created_by',
                },
                from: {
                  ...(join_type === 'self' ? { alias: 'created_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              }
            : {
                from: {
                  entity,
                  field: 'created_by',
                },
                to: {
                  ...(join_type === 'left' ? { alias: 'created_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              },
      };
      const updated_by_join = {
        type: join_type,
        field_relation:
          join_type === 'self'
            ? {
                to: {
                  entity,
                  field: 'updated_by',
                },
                from: {
                  ...(join_type === 'self' ? { alias: 'updated_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              }
            : {
                from: {
                  entity,
                  field: 'updated_by',
                },
                to: {
                  ...(join_type === 'left' ? { alias: 'updated_by' } : {}),
                  entity: 'contact',
                  field: 'id',
                },
              },
      };

      const pluck_object = {
        contacts: ['first_name', 'last_name'],
        [pluralize(input?.entity)]: input.pluck,
      };

      const query = ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        //@ts-expect-error - expect error
        query: {
          pluck: input.pluck,
          track_total_records: true,
          pluck_object: pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
          order: {
            starts_at:
              // current 5 *  input.limit 50 = 250
              (input.current || 0) === 0
                ? 0
                : (input.current || 1) * (input.limit || 100) -
                  (input.limit || 100),
            limit: input.limit || 1,
            by_field:
              input?.sorting?.length === 1 ? input.sorting[0]?.id : 'code',
            by_direction:
              input?.sorting?.length === 1
                ? input.sorting[0]?.desc
                  ? EOrderDirection.DESC
                  : EOrderDirection.ASC
                : EOrderDirection.DESC,
          },
          ...(pluck_object
            ? {
                multiple_sort:
                  input.sorting?.length && input?.sorting.length > 1
                    ? formatSorting(input.sorting, input.entity)
                    : [],
                concatenate_fields: [
                  {
                    fields: ['first_name', 'last_name'],
                    field_name: 'full_name',
                    separator: ' ',
                    entity: 'contacts',
                    aliased_entity: 'created_by',
                  },
                  {
                    fields: ['first_name', 'last_name'],
                    field_name: 'full_name',
                    separator: ' ',
                    entity: 'contacts',
                    aliased_entity: 'updated_by',
                  },
                ],
              }
            : {}),
        },
      });
      if (pluck_object) {
        query.join(created_by_join).join(updated_by_join);
      }
      const { total_count: totalCount = 1, data: items } =
        await query.execute();

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          updated_by,
          ...rest
        } = item;
        return {
          ...entity_data,
          ...rest,
          created_by: created_by
            ? `${created_by.first_name} ${created_by.last_name}`
            : null,
          updated_by: updated_by
            ? `${updated_by.first_name} ${updated_by.last_name}`
            : null,
        };
      });

      console.log("%c Line:363 🍰 formatted_items", "color:#f5ce50", formatted_items);
      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      };
    }),
  getSessionGridTabs: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const gridTabId = headerList.get('x-grid-tab-id') || '';
    const pathName = headerList.get('x-pathname') || '';
    const [, , mainEntity, application] = pathName.split('/');
    if (application !== 'grid' || !mainEntity) return [];
    const _tabMenuId = tabMenuId({
      _mainEntity: mainEntity || '',
      _application: application || '',
      _id: ctx.session.account.contact.id,
    });
    const _tabMenuHref = `/portal/${mainEntity}/grid`;
    const activeTab = (await ctx.redisClient.getCachedData(
      _tabMenuId,
    )) as ITabGrid[];
    if (!gridTabId) {
      if (activeTab) return activeTab;
    }
    const gridTabFilterList = (await ctx.redisClient.getCachedData(
      _tabMenuId,
    )) as ITabGrid[];
    if (!gridTabFilterList) return [];
    const setActiveTab = gridTabFilterList?.map((tab) => {
      const newCurrent =
        _tabMenuHref === gridTabId
          ? activeTab?.find((e) => e.id === gridTabId)
          : gridTabId;
      return {
        ...tab,
        current: tab.id === newCurrent,
      };
    });

    ctx.redisClient.cacheData(_tabMenuId, setActiveTab);

    return setActiveTab;
  }),
  appendGridTab: privateProcedure
    .input(
      z.object({
        filter_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });

      const filters = await ctx.redisClient.getCachedData(
        `${input.filter_id}:filters`,
      );
      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const found = menus?.find((menu) => menu.id === input.filter_id);
      const copyTab = SetTab({
        name: found?.name || '',
        entity: mainEntity!,
      });
      const newTabs = [...menus, copyTab]?.map((item) => {
        if (item.id === copyTab.id) {
          return {
            ...item,
            current: true,
          };
        }
        return {
          ...item,
          current: false,
        };
      });
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
      await ctx.redisClient.cacheData(`${copyTab.id}:filters`, filters);
      return {
        filter_href: copyTab.href,
      };
    }),
  removeGridTab: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });
      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      const newTabs = menus?.filter((tab) => tab.id !== input);
      const activeTab = newTabs?.find((tab) => tab.current);
      const activeTabBeenRemoved = newTabs?.map((item, index) => {
        if (index === newTabs?.length - 1) {
          return {
            ...item,
            current: true,
          };
        }
        return item;
      });

      await ctx.redisClient.cacheData(
        _tabMenuId,
        activeTab ? newTabs : activeTabBeenRemoved,
      );

      return {
        filter_href: activeTab
          ? activeTab?.href
          : activeTabBeenRemoved?.find((tab) => tab.current)?.href,
      };
    }),
  saveFilters: privateProcedure
    .input(ZodSaveFilters)
    .mutation(async ({ input, ctx }) => {
      return await ctx.redisClient.cacheData(
        `${input.filter_id}:filters`,
        input.filters,
      );
    }),
  getFilters: privateProcedure
    .input(ZodGetFilters)
    .query(async ({ input, ctx }) => {
      const filters = (await ctx.redisClient.getCachedData(
        `${input.filter_id}:filters`,
      )) as IGridFilterBy[];
      return filters;
    }),
  saveSorts: privateProcedure
    .input(
      z.object({
        filter_id: z.string(),
        sort_by_field: z.string(),
        sort_by_direction: z.enum(['asc', 'desc', 'ascending', 'descending']),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.redisClient.cacheData(`${input.filter_id}:sorts`, {
        sort_by_field: input.sort_by_field,
        sort_by_direction: input.sort_by_direction,
      });
    }),
  getSorts: privateProcedure
    .input(ZodGetFilters)
    .query(async ({ input, ctx }) => {
      const sorts = (await ctx.redisClient.getCachedData(
        `${input.filter_id}:sorts`,
      )) as ISortBy;
      return sorts;
    }),
  newGridTab: privateProcedure
    .input(
      z.object({
        tabName: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });

      const menus = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const copyTab = SetTab({
        name: input?.tabName,
        entity: mainEntity!,
      });
      const newTabs = [...menus, copyTab]?.map((item) => {
        if (item.id === copyTab.id) {
          return {
            ...item,
            current: true,
          };
        }
        return {
          ...item,
          current: false,
        };
      });
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
      return {
        filter_id: copyTab.id,
        filter_href: copyTab.href,
        mainEntity: mainEntity!,
      } as {
        filter_id: string;
        filter_href: string;
        mainEntity: string;
      };
    }),
  deleteRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return (
        ctx.dnaClient
          // ! TODO Delete in ORM features ( Not Working )
          .update(input?.id, {
            entity: input?.entity,
            token: ctx.token.value,
            mutation: {
              params: {
                tombstone: 1,
              },
            },
          })
          .execute()
      );
    }),
  archiveRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ARCHIVED,
            },
          },
        })
        .execute();
    }),
  activateRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ACTIVE,
            },
          },
        })
        .execute();
    }),
  restoreRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.dnaClient
        .getPreviousStatus(input.id, {
          entity: input?.entity,
          token: ctx.token.value,
        })
        .execute();

      const [previous_status] = result?.data || [];

      return ctx.dnaClient
        .update(input?.id, {
          entity: input?.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: previous_status?.value || EStatus.DRAFT,
            },
          },
        })
        .execute();
    }),
  archiveBulkRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        record_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { entity, record_ids } = input;
      await Promise.all(
        record_ids.map(async (id) => {
          return ctx.dnaClient
            .update(id, {
              entity,
              token: ctx.token.value,
              mutation: {
                params: {
                  status: EStatus.ARCHIVED,
                },
              },
            })
            .execute();
        }),
      );
    }),
  updateReportSorting: privateProcedure
    .input(
      z.object({
        sorting: z.array(
          z.object({
            id: z.string(),
            desc: z.boolean(),
            sort_key: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sorting } = input;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');
      const [, , mainEntity, application] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });
      const menus = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(menus) ? menus : [];
      const defaultSort = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : tabDetails?.find((tab) => tab.current);

      const newTabs = tabDetails?.map((tab) => {
        if (tab.id === defaultSort.id) {
          return {
            ...tab,
            sorts: sorting,
          };
        }
        return tab;
      });
      if (!defaultSort.is_default) {
        // update the grid filter entity on database
        await ctx.dnaClient
          .update(defaultSort.id, {
            entity: 'grid_filter',
            token: ctx.token.value,
            mutation: {
              params: {
                sorts: sorting,
              },
            },
          })
          .execute();
      }
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
    }),
  updateReportFilter: privateProcedure
    .input(
      z.object({
        filters: z.array(
          z.object({
            type: z.string(),
            field: z.string().optional(),
            entity: z.string().optional(),
            operator: z.string().optional(),
            values: z.array(z.string()).optional(),
            id: z.string().optional(),
            label: z.string().optional(),
            default: z.boolean().optional(),
            display_value: z.string().optional(),
            filters: z.array(z.any()).optional()
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filters } = input;
      const headerList = headers();

      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });
      const menus = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(menus) ? menus : [];
      const defaultFilter = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : tabDetails?.find((tab) => tab.current);
      const newTabs = tabDetails?.map((tab) => {
        if (tab.id === defaultFilter.id) {
          return {
            ...tab,
            group_advance_filters:
              tab?.group_advance_filters?.length > 0
                ? filters
                : [],
            advance_filters:
              tab?.group_advance_filters?.length > 0 ? [] : filters,
            default_filter: [],
          };
        }
        return tab;
      });

      if (!defaultFilter.is_default) {
        // update the grid filter entity on database
        await ctx.dnaClient
          .update(defaultFilter.id, {
            entity: 'grid_filter',
            token: ctx.token.value,
            mutation: {
              params: {
                advance_filters:
                  defaultFilter.group_advance_filters?.length > 0
                    ? []
                    : filters,
                group_advance_filters:
                  defaultFilter.group_advance_filters?.length > 0
                    ? filters
                    : [],
              },
            },
          })
          .execute();
      }
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
    }),
  updateReportPagination: privateProcedure
    .input(
      z.object({
        current_page: z.number(),
        limit_per_page: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { current_page, limit_per_page } = input;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: 'pagination' })) ?? '';
      if (!cached_id) return;
      return await ctx.redisClient.cacheData(cached_id, {
        current_page,
        limit_per_page,
      });
    }),
  getReportCachedData: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const pathName = headerList.get('x-pathname') || '';
    const searchQueryParams =
      headerList.get('x-full-search-query-params') || '';
    const searchParams = new URLSearchParams(searchQueryParams);
    const filter_id = searchParams.get('filter_id');
    const [, , mainEntity, application] = pathName.split('/');
    if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
      return [];
    const cacheTypes: TReportDataType[] = [
      'pagination',
      'grid_tabs',
    ];
    const cacheIds = await Promise.all(
      cacheTypes.map((type) => gridCacheId({ context: ctx, type })),
    );

    const [pagination, grid_tabs] = await Promise.all(
      cacheIds
        .map((id) => (id ? ctx.redisClient.getCachedData(id) : null))
        .filter(Boolean),
    );
    const tabDetails = Array.isArray(grid_tabs) ? grid_tabs : [];
    const reportPagination: IPagination =
      typeof pagination === 'object' ? pagination : {};

    const filterDetails = filter_id
      ? (tabDetails?.find((tab) => tab.id === filter_id))
      : (tabDetails?.find((tab) => tab.current));

    const filter: ISearchItem[] = filterDetails?.default ? filterDetails?.advance_filters : filterDetails?.default_filter;

    const groupAdvanceFilters: ISearchItem[] = filter_id
      ? (tabDetails?.find((tab) => tab.id === filter_id)
          ?.group_advance_filters ?? [])
      : (tabDetails?.find((tab) => tab.current)?.group_advance_filters ?? []);

    const defaultFilters = (filter ?? []).filter((item) => item.default === true);
    const sorts: ISortBy = filter_id
      ? (tabDetails?.find((tab) => tab.id === filter_id)?.sorts ?? [])
      : (tabDetails?.find((tab) => tab.current)?.sorts ?? []);
    const defaultSorts: ISortBy = filter_id
      ? (tabDetails?.find((tab) => tab.id === filter_id)?.default_sorts ?? [])
      : (tabDetails?.find((tab) => tab.current)?.default_sorts ?? []);

    const gridColumns = filter_id
      ? (tabDetails?.find((tab) => tab.id === filter_id)?.columns ?? [])
      : (tabDetails?.find((tab) => tab.current)?.columns ?? []);

    const advanceFilter = filter?.map((item) => {
      return {
        entity: item.entity,
        operator: item.operator,
        type: item.type,
        field: item.field,
        values: item.values,
        default: item.default,
      };
    });

    return {
      filters: {
        reportFilter: defaultFilters,
        advanceFilter,
        defaultFilters,
        groupAdvanceFilters,
      },
      sorts: {
        sorting: sorts,
        defaultSorting: defaultSorts,
      },
      pagination: reportPagination,
      columns: gridColumns,
    };
  }),

  getInfiniteData: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        query_params: z.any(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { entity, query_params } = input;
      const query = ctx.dnaClient.findAll({
        entity: entity,
        token: ctx.token.value,
        query: {
          pluck: query_params.pluck,
        },
      });

      const result = await query.execute();
      const { data, total_count } = result;
      return {
        data,
        total_count,
      };
    }),
  updateGridTabs: privateProcedure
    .input(
      z.object({
        href: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      if (application !== 'grid' || !mainEntity) return [];
      const cached_id =
        (await gridCacheId({ context: ctx, type: 'grid_tabs' })) ?? '';
      if (!cached_id) return;
      const cachedReportTabs = await ctx.redisClient.getCachedData(cached_id);
      const reportTabs = Array.isArray(cachedReportTabs)
        ? cachedReportTabs
        : [];
      const updatedTabs = reportTabs?.map((tab) => ({
        ...tab,
        current: tab.href === input.href,
      }));
      await ctx.redisClient.cacheData(cached_id, updatedTabs);
      return updatedTabs;
    }),
  getGridTabs: privateProcedure.query(async ({ ctx }) => {
    const headerList = headers();
    const pathName = headerList.get('x-pathname') || '';
    const [, , mainEntity, application] = pathName.split('/');
    if (application !== 'grid' || !mainEntity) return [];
    const cached_id =
      (await gridCacheId({ context: ctx, type: 'grid_tabs' })) ?? '';
    if (!cached_id) return;
    const cachedReportTabs = await ctx.redisClient.getCachedData(cached_id);
    const reportTabs = Array.isArray(cachedReportTabs) ? cachedReportTabs : [];
    return reportTabs;
  }),
});
