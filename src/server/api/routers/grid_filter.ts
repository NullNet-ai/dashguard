import { headers } from 'next/headers';
import { ulid } from 'ulid';
import { z } from 'zod';
import { tabMenuId } from '~/lib/tab-menu-id';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { ITabGrid } from '../types';
import { get_meta_header } from '~/utils/request-header';

const ENTITY = 'grid_filter';

const filterCriteriaSchema = z.object({
  operator: z.string(),
  type: z.enum(['criteria', 'operator']),
  field: z.string().optional(),
  label: z.string().optional(),
  values: z.array(z.string()).optional(),
  default: z.boolean().optional(),
  entity: z.string().optional(),
  disabled: z.boolean().optional(),
  parse_as: z.string().optional(),
});

const sortSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
  type: z.string().optional(),
  sort_key: z.string().optional(),
  is_case_sensitive_sorting: z.boolean().optional(),
});

const groupSchema = z.object({
  field: z.string(),
  label: z.string(),
  value: z.string(),
  desc: z.boolean(),
  is_case_sensitive_sorting: z.boolean().optional(),
  type: z.string().optional(),
});

const columnSchema = z.object({
  header: z.string(),
  accessorKey: z.string(),
  label: z.string(),
  isShow: z.boolean(),
  order: z.number(),
  id: z.string().optional(),
});

const filterGroupSchema = z.object({
  id: z.string(),
  groupOperator: z.enum(['and', 'or']).default('and'),
  filters: z.array(filterCriteriaSchema),
});

const gridFilterSchema = z.object({
  name: z.string().min(1),
  default_filter: z.array(filterCriteriaSchema).or(z.array(z.any())),
  sorts: z.array(sortSchema),
  groups: z.array(groupSchema).optional(),
  columns: z.array(z.any()),
  default_sorts: z.array(sortSchema).optional(),
  id: z.string().optional(),
  filter_groups: z.array(filterGroupSchema),
  group_advance_filters: z.array(filterCriteriaSchema).or(z.array(z.any())),
  gridKey: z.string().optional(),
  advance_filters: z.array(filterCriteriaSchema).or(z.array(z.any())),
});

export const gridFilterRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  createGridFilter: privateProcedure
    .input(
      gridFilterSchema.extend({
        gridKey: z.string().optional(),
        entity: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const account_org_id = ctx?.session?.account?.account_organization_id;
      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');
      const { gridKey, ...rest } = input ?? {};
      const filter_id = ulid();
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: gridKey,
        _identifier: identifier,
      });
      const gridTabFilterList = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      const href = `${pathName}?filter_id=${filter_id}`;
      const additionalTab = {
        ...rest,
        id: filter_id,
        entity: mainEntity,
        default_filter: input?.default_filter || [],
        advance_filters: input.advance_filters?.length
          ? input.advance_filters
          : input.default_filter,
        is_current: false,
        is_default: false,
        href,
      };

      const updatedGridTabs = [...gridTabFilterList, additionalTab];
      await ctx.redisClient.cacheData(_tabMenuId, updatedGridTabs);
      const meta_header = await get_meta_header();
      ctx.dnaClient
        .create({
          entity: ENTITY,
          token,
          ...meta_header,
          mutation: {
            params: {
              id: filter_id,
              name: input.name,
              grid_id: '',
              contact_id: id,
              account_organization_id: account_org_id,
              link: href,
              is_current: false,
              is_default: false,
              entity: input.entity || mainEntity,
              columns: input.columns,
              groups: input.groups,
              sorts: input.sorts,
              advance_filters: input.default_filter,
              default_sorts: input.default_sorts,
              filter_groups: input.filter_groups,
              group_advance_filters: input.group_advance_filters,
            },
            pluck: [
              'id',
              'name',
              'grid_id',
              'link',
              'is_current',
              'is_default',
              'entity',
              'columns',
              'groups',
              'sorts',
              'advance_filters',
              'filter_groups',
              'group_advance_filters',
            ],
          },
        })
        .execute();

      return additionalTab;
    }),

  updateGridAllFilter: privateProcedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      const meta_header = await get_meta_header();
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
      });

      await ctx.redisClient.cacheData(_tabMenuId, input?.tabs);

      // update the grid filter entity on database
      const promise = input?.tabs?.map(async (tab: any) => {
        return ctx.dnaClient
          .update(tab.id, {
            entity: ENTITY,
            token,
            ...meta_header,
            mutation: {
              params: {
                is_current: tab.current,
              },
            },
          })
          .execute();
      });
      Promise.all(promise);
    }),
  updateGridFilter: privateProcedure
    .input(gridFilterSchema)
    .mutation(async ({ ctx, input }) => {
      
      const token = ctx?.token.value;

      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');

      const meta_header = await get_meta_header();

      ctx.dnaClient
        .update(input.id!, {
          entity: ENTITY,
          token,
          ...meta_header,
          mutation: {
            params: {
              name: input.name,
              columns: input.columns,
              groups: input.groups,
              sorts: input.sorts,
              advance_filters: input.default_filter,
              default_sorts: input.default_sorts,
              filter_groups: input.filter_groups,
              group_advance_filters: input.group_advance_filters,
            },
            pluck: [
              'id',
              'name',
              'grid_id',
              'link',
              'is_current',
              'is_default',
              'entity',
              'columns',
              'groups',
              'sorts',
              'advance_filters',
              'filter_groups',
              'group_advance_filters',
            ],
          },
        })
        .execute();

      // if (!success) {
      //   throw new Error(message);
      // }

      // update data on redis
      // if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input?.gridKey || '',
        _identifier: identifier || '',
      });

      const tabs = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      const updatedTab = tabs.map((tab) => {
        if (tab.id === input.id) {
          return {
            ...tab,
            name: input.name,
            columns: input.columns,
            groups: input.groups,
            sorts: input.sorts,
            advance_filters: input.advance_filters?.length
              ? input.advance_filters
              : input.default_filter,
            default_sorts: input.default_sorts,
            default_filter: input.default_filter,
            filter_groups: input.filter_groups,
            group_advance_filters: input.group_advance_filters,
          };
        }
        return tab;
      });
      await ctx.redisClient.cacheData(_tabMenuId, updatedTab);
      return updatedTab?.find((tab) => tab.id === input.id);
    }),

  removeGridFilter: privateProcedure
    .input(
      z.object({
        id: z.string(),
        gridKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = await headers();
      const gridTabId = headerList.get('x-grid-tab-id') || '';
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, indentifier] = pathName.split('/');

      const meta_header = await get_meta_header();
      const token = ctx?.token.value;

      // drop by
      await ctx.dnaClient
        .delete(input.id, {
          is_permanent: false,
          entity: ENTITY,
          ...meta_header,
          token,
          mutation: {
            params: {
              status: 'Archived',
            },
          },
        })
        .execute();

      // remove from redis
      // if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: indentifier,
      });
      const tabs = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      const updatedTab = tabs.filter((tab) => tab.id !== input.id);

      // if the gridTabId is same as input id find the index of the gridTabId
      // and set the index before it as current true

      if (gridTabId === input.id) {
        const index = tabs.findIndex((tab) => tab.id === input.id);
        if (index > 0) {
          updatedTab[index - 1]!.current = true;
        }
      }
      await ctx.redisClient.cacheData(_tabMenuId, updatedTab);
      // return the href the tab that is current
      const currentHref = updatedTab.find((tab) => tab.current)?.href;
      return currentHref;
    }),

  duplicateGridFilter: privateProcedure
    .input(
      z.object({
        tab: z.any(),
        gridKey: z.string().optional(),
        entity: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meta_header = await get_meta_header();
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;

      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');

      const filter_id = input.tab.id || ulid();
      const href = input.tab.link || `${pathName}?filter_id=${filter_id}`;

      let filter: any = {};
      const { data, message, success, errors } = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token,
          ...meta_header,
          mutation: {
            params: {
              id: filter_id,
              name: `${input.tab.name}`,
              grid_id: '',
              contact_id: id,
              account_organization_id:
                ctx.session.account.account_organization_id,
              link: href,
              is_current: false,
              is_default: false,
              entity: input.entity || mainEntity,
              columns: input.tab.columns || [],
              groups: input.tab.groups || [],
              sorts: input.tab.sorts || [],
              advance_filters: input.tab.default_filter || [],
              default_sorts: input.tab.default_sorts || [],
              filter_groups: input.tab.filter_groups || [],
              group_advance_filters: input.tab.group_advance_filters || [],
            },
            pluck: [
              'id',
              'name',
              'grid_id',
              'link',
              'is_current',
              'is_default',
              'entity',
              'columns',
              'groups',
              'sorts',
              'advance_filters',
              'default_sorts',
              'filter_groups',
            ],
          },
        })
        .execute();

      if (!success) {
        throw new Error(message);
      }

      filter = data[0] || {};

      // insert to redis
      // if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input.gridKey,
        _identifier: identifier,
      });
      const tabs = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];
      tabs.push({
        id: filter?.id,
        name: filter?.name,
        current: true,
        href: filter?.link,
        default: false,
        columns: filter?.columns,
        groups: filter?.groups,
        sorts: filter?.sorts,
        advance_filters: filter?.advance_filters,
        default_sorts: filter?.default_sorts,
        default_filter: filter?.advance_filters,
        filter_groups: filter?.filter_groups,
        group_advance_filters: filter?.group_advance_filters,
      });
      await ctx.redisClient.cacheData(_tabMenuId, tabs);

      return filter?.link;
    }),
    getTabData: privateProcedure
    .input(
      z.object({
        tab_id: z.string(),
        gridKey: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meta_header = await get_meta_header();
      const token = ctx?.token.value;

      const headerList = await headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application, identifier] = pathName.split('/');

      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.account_organization_id,
        _gridKey: input?.gridKey || '',
        _identifier: identifier || '',
      });

      const tabs = (await ctx.redisClient.getCachedData(
        _tabMenuId,
      )) as ITabGrid[];

      return tabs?.find((tab) => tab.id === input.tab_id);
    }),
});
