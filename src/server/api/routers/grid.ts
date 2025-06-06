import { headers } from 'next/headers';
import { z } from 'zod';

import { type ISortBy } from '~/components/platform/Grid/Category/type';
import {
  EOperator,
  IGroupAdvanceFilters,
  type IAdvanceFilters,
  type IResponse,
} from '@dna-platform/common-orm';
import { EOrderDirection } from '@dna-platform/common-orm/build/enums/model';

import {
  type IPagination,
  type ISearchItem,
} from '~/components/platform/Grid/Search/types';
import {
  gridCacheId,
  type TReportDataType,
} from '~/components/platform/Grid/utils/grid-cache-id';
import {
  SetIdTab,
  SetTab,
} from '~/components/platform/Grid/utils/grid-default-tab';
import { getGridLink } from '~/components/platform/Grid/utils/grid-get-link';
import { tabMenuId } from '~/lib/tab-menu-id';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { formatSorting } from '~/server/utils/formatSorting';
import ZodCreateEntity from '~/server/zodSchema/grid/createEntity';
import ZodGetFilters from '~/server/zodSchema/grid/getFilters';
import ZodItems from '~/server/zodSchema/grid/items';
import ZodSaveFilters from '~/server/zodSchema/grid/saveFilters';

import { pluralize } from '../../utils/pluralize';
import { EStatus, type IGridFilterBy, type ITabGrid } from '../types';
import {
  addCommonGridConcatenates,
  addCommonGridJoins,
  addCommonGridPluckObject,
} from '~/server/utils/queryBuilder';

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
        .catch((error: any) => {
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
        _id: ctx.session.account.account_organization_id,
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

      const contact_id = ctx.session.account.account_organization_id;
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
              field: 'account_organization_id',
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
        _id: ctx.session.account.account_organization_id,
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
          current: item.is_current,
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
        group_advance_filters: _group_advance_filters = [],
      } = input;

      const pluck_object = {
        ...addCommonGridPluckObject(),
        [pluralize(entity)]: input.pluck,
      };

      const query = ctx.dnaClient.findAll({
        entity,
        token: ctx.token.value,
        query: {
          pluck: input.pluck,
          track_total_records: true,
          pluck_object: pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
          group_advance_filters: _group_advance_filters as IGroupAdvanceFilters<
            string | number
          >[],
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
          multiple_sort:
            sorting?.length && sorting?.length > 1
              ? formatSorting(sorting)
              : [],
          concatenate_fields: [...addCommonGridConcatenates(input?.entity)],
        },
      });
      addCommonGridJoins(query, entity);

      if (input.grouping?.length) {
        query.groupBy({
          query: {
            fields: input.grouping,
            has_count: true,
          },
        });
      }
      const { total_count: totalCount = 1, data: items } =
        await query.execute();

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit);

      if (input.grouping?.length) {
        return {
          totalCount,
          items: items,
          currentPage: 0,
          totalPages,
        };
      }

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
          created_by: created_by?.full_name ?? '',
          updated_by: updated_by?.full_name ?? '',
        };
      });

      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      };
    }),
  getSessionGridTabs: privateProcedure
    .input(
      z.object({
        gridKey: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headerList = headers();
      const gridTabId = headerList.get('x-grid-tab-id') || '';
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');
      const searchParams = headerList.get('x-full-search-query-params') || '';

      // if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input?.gridKey || '',
        _identifier: identifier || '',
      });

      const _tabMenuHref = `/portal/${mainEntity}/grid`;
      const activeTab = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      if (!gridTabId) {
        if (activeTab) return activeTab;
        if (input?.gridKey && application !== 'grid') {
          const href = `${pathName}?${searchParams ? searchParams + '&filter_id=' : 'filter_id='}`;
          const setIdTab = SetIdTab(input.gridKey, href);
          ctx.redisClient.cacheData(_tabMenuId, setIdTab);
          return setIdTab;
        }
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
        _id: ctx.session.account.account_organization_id,
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
        _id: ctx.session.account.account_organization_id,
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
        _id: ctx.session.account.account_organization_id,
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
            is_case_sensitive_sorting: z.boolean().optional(),
          }),
        ),
        gridKey: z.string().optional(),
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
      const [, , mainEntity, application, identifier] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: identifier || '',
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
            values: z.array(z.any()).optional(),
            id: z.string().optional(),
            label: z.string().optional(),
            default: z.boolean().optional(),
            display_value: z.any().optional(),
            filters: z.array(z.any()).optional(),
            parse_as: z.string().optional(),
          }),
        ),
        gridKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filters } = input;
      const headerList = headers();

      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: identifier || '',
      });
      const menus = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(menus) ? menus : [];
      const defaultFilter = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : tabDetails?.find((tab) => tab.current);
      const newTabs = tabDetails?.map((tab) => {
        if (tab.id === defaultFilter?.id) {
          return {
            ...tab,
            group_advance_filters:
              tab?.group_advance_filters?.length > 0 ? filters : [],
            advance_filters:
              tab?.group_advance_filters?.length > 0 ? [] : filters,
            default_filter: [],
          };
        }
        return tab;
      });

      if (!defaultFilter?.is_default) {
        // update the grid filter entity on database
        await ctx.dnaClient
          .update(defaultFilter?.id, {
            entity: 'grid_filter',
            token: ctx.token.value,
            mutation: {
              params: {
                advance_filters:
                  defaultFilter?.group_advance_filters?.length > 0
                    ? []
                    : filters,
                group_advance_filters:
                  defaultFilter?.group_advance_filters?.length > 0
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
        pagination: z.object({
          current_page: z.number(),
          limit_per_page: z.number(),
        }),
        gridKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pagination } = input;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');
      const [, , mainEntity, application, identifier] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: identifier || '',
      });
      const menus = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(menus) ? menus : [];
      const defaultPagination = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : tabDetails?.find((tab) => tab.current);

      const newTabs = tabDetails?.map((tab) => {
        if (tab.id === defaultPagination.id) {
          return {
            ...tab,
            pagination,
          };
        }
        return tab;
      });
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
    }),
  getReportCachedData: privateProcedure
    .input(
      z
        .object({
          gridKey: z.string().optional(),
          application: z.string().optional(),
          entity: z.string().optional(),
          identifier: z.string().optional(),
          pathname: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const headerList = headers();
      const pathName = input?.pathname || headerList.get('x-pathname') || '';
      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');
      const [, , _mainEntity, _application, _identifier] = pathName.split('/');

      const application = input?.application || _application;
      const mainEntity = input?.entity || _mainEntity;
      const identifier = input?.identifier || _identifier;

      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input?.gridKey,
        _identifier: identifier || '',
      });
      const grid_tabs = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(grid_tabs) ? grid_tabs : [];
      // const reportPagination: IPagination =
      //   typeof pagination === 'object' ? pagination : {};

      const currentGridTab = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : null;

      const filterDetails = currentGridTab
        ? currentGridTab
        : tabDetails?.find((tab) => tab.current);

      const filter = filterDetails?.advance_filters;
      const groupAdvanceFilters: ISearchItem[] = filter_id
        ? (tabDetails?.find((tab) => tab.id === filter_id)
            ?.group_advance_filters ?? [])
        : (tabDetails?.find((tab) => tab.current)?.group_advance_filters ?? []);

      const defaultFilter = (tabDetails ?? []).find(
        (item) => item.default === true,
      );
      const sorts: ISortBy = filterDetails?.sorts ?? [];
      const defaultSorts: ISortBy = filterDetails?.default_sorts ?? [];
      const gridColumns = filterDetails?.columns ?? [];
      const groups = filterDetails?.groups ?? [];
      const pagination = filterDetails?.pagination ?? [];

      const advanceFilter = filter?.map((item: any) => {
        return {
          entity: item.entity,
          operator: item.operator,
          type: item.type,
          field: item.field,
          values: item.values,
          default: item.default,
          ...(item.parse_as ? { parse_as: item.parse_as } : {}),
        };
      });
      const groupSorts = groups?.map((item: any) => ({
        id: item.value,
        desc: typeof item.desc === 'boolean' ? item.desc : false,
        sort_key: item.field,
        is_case_sensitive_sorting: item.is_case_sensitive_sorting ?? false,
      }));
      const currentTab = filterDetails ? filterDetails : defaultFilter;

      const gridtabs = tabDetails?.map((tab) => ({
        ...tab,
        current: tab.id === currentTab?.id,
        is_current: tab.id === currentTab?.id,
      }));

      return {
        grid_tabs: gridtabs,
        filters: {
          reportFilters: filter,
          advanceFilter,
          defaultFilters: filterDetails?.default_filter,
          groupAdvanceFilters,
        },
        sorts: {
          sorting: sorts,
          defaultSorting: defaultSorts,
          groupSorts,
        },
        pagination: {
          current_page: +(pagination?.current_page ?? '1'),
          limit_per_page: +(pagination?.limit_per_page ?? '100'),
        },
        columns: gridColumns,
        groups,
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
  updateReportGrouping: privateProcedure
    .input(
      z.object({
        grouping: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            field: z.string(),
            desc: z.boolean(),
            is_case_sensitive_sorting: z.boolean().optional(),
          }),
        ),
        gridKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { grouping } = input;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const searchQueryParams =
        headerList.get('x-full-search-query-params') || '';
      const searchParams = new URLSearchParams(searchQueryParams);
      const filter_id = searchParams.get('filter_id');
      const [, , mainEntity, application, identifier] = pathName.split('/');
      if (!['grid', 'record'].includes(application ?? '') || !mainEntity)
        return [];

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: identifier || '',
      });
      const menus = await ctx.redisClient.getCachedData(_tabMenuId);
      const tabDetails = Array.isArray(menus) ? menus : [];
      const currentGridTab = filter_id
        ? tabDetails?.find((tab) => tab.id === filter_id)
        : null;

      const defaultGroup = currentGridTab
        ? currentGridTab
        : tabDetails?.find((tab) => tab.current);

      const newTabs = tabDetails?.map((tab) => {
        if (tab.id === defaultGroup.id) {
          return {
            ...tab,
            groups: grouping,
          };
        }
        return tab;
      });
      if (!defaultGroup?.is_default) {
        // update the grid filter entity on database
        ctx.dnaClient
          .update(defaultGroup.id, {
            entity: 'grid_filter',
            token: ctx.token.value,
            mutation: {
              params: {
                groups: grouping,
              },
            },
          })
          .execute();
      }
      await ctx.redisClient.cacheData(_tabMenuId, newTabs);
    }),
  initializeGridTabs: privateProcedure
    .input(
      z.object({
        gridKey: z.string().optional(),
        entity: z.string().optional(),
        application: z.string().optional(),
        identifier: z.string().optional(),
        defaultGridTabs: z.array(z.any()).optional(),
        pathname: z.string().optional(),
        defaultSorting: z.array(z.any()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headerList = headers();
      const gridTabId = headerList.get('x-grid-tab-id') || '';
      const pathName = input?.pathname || headerList.get('x-pathname') || '';
      const [, , _mainEntity, _application, _identifier] = pathName.split('/');
      const mainEntity = input?.entity || _mainEntity;
      const application = input?.application || _application;
      const identifier = input?.identifier || _identifier;

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input?.gridKey || '',
        _identifier: identifier || '',
      });
      const grid_tabs = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      const tabs = Array.isArray(grid_tabs) ? grid_tabs : [];
      if (!tabs.length) {
        const entity = input.gridKey || mainEntity;
        const href = `${pathName}?filter_id=`;
        const defaultTab = SetIdTab(
          entity!,
          href,
          input.defaultGridTabs,
          input.defaultSorting,
        );
        await ctx.redisClient.cacheData(_tabMenuId, defaultTab);
        return defaultTab;
      }
      const isAllDefault = tabs.every((tab) => tab.default);
      if (!isAllDefault) return tabs;
      const contact_id = ctx.session.account.account_organization_id;
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
              field: 'account_organization_id',
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
            {
              operator: EOperator.AND,
              type: 'operator',
              default: true,
            },
            {
              type: 'criteria',
              field: 'link',
              operator: EOperator.LIKE,
              values: [pathName],
            },
          ] as IAdvanceFilters[],
        },
      });
      const { data: items } = await query.execute();

      if (tabs.length - 1 !== items.length) {
        const uniqueTabsMap = new Map();

        tabs.forEach((tab) => {
          uniqueTabsMap.set(tab.id, tab);
        });

        items.forEach((item) => {
          if (!uniqueTabsMap.has(item.id)) {
            uniqueTabsMap.set(item.id, {
              ...item,
              href: item.link,
              default_filter: item.advance_filters,
              current: false,
              is_current: false,
            });
          }
        });
        const merged_tabs = Array.from(uniqueTabsMap.values());
        await ctx.redisClient.cacheData(_tabMenuId, merged_tabs);
        return merged_tabs;
      }
      return tabs;
    }),
});
