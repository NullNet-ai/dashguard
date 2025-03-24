import { headers } from 'next/headers';
import { ulid } from 'ulid';
import { z } from 'zod';
import { tabMenuId } from '~/lib/tab-menu-id';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { ITabGrid } from '../types';

const ENTITY = 'grid_filter';

const filterCriteriaSchema = z.object({
  operator: z.string(),
  type: z.enum(['criteria', 'operator']),
  field: z.string().optional(),
  label: z.string().optional(),
  values: z.array(z.string()).optional(),
  default: z.boolean().optional(),
  entity: z.string().optional(),
});

const sortSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

const groupSchema = z.object({
  field: z.string(),
  label: z.string(),
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
  columns: z.array(columnSchema),
  default_sorts: z.array(sortSchema),
  id: z.string().optional(),
  filter_groups: z.array(filterGroupSchema),
  group_advance_filters : z.array(filterCriteriaSchema).or(z.array(z.any())),
});

export const gridFilterRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  createGridFilter: privateProcedure
    .input(gridFilterSchema)
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');
      const filter_id = ulid();

      const { data, message, success, errors } = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token,
          mutation: {
            params: {
              id: filter_id,
              name: input.name,
              grid_id: '',
              contact_id: id,
              link: `/portal/${mainEntity}/${application}?filter_id=${filter_id}`,
              is_current: false,
              is_default: false,
              entity: mainEntity,
              columns: input.columns,
              groups: input.groups,
              sorts: input.sorts,
              advance_filters: input.default_filter,
              default_sorts: input.default_sorts,
              filter_groups : input.filter_groups,
              group_advance_filters : input.group_advance_filters,
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
              'group_advance_filters'
            ],
          },
        })
        .execute();

      if (!success) {
        throw new Error(message);
      }
      return data;
    }),


  updateGridAllFilter: privateProcedure
    .input(z.any())
   .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [,, mainEntity, application] = pathName.split('/');
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
      });

      await ctx.redisClient.cacheData(_tabMenuId, input);

   }),
  updateGridFilter: privateProcedure
    .input(gridFilterSchema)
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;

      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [,, mainEntity, application] = pathName.split('/');
      

      const { data, message, success } = await ctx.dnaClient
        .update(input.id!, {
          entity: ENTITY,
          token,
          mutation: {
            params: {
              name: input.name,
              columns: input.columns,
              groups: input.groups,
              sorts: input.sorts,
              advance_filters: input.default_filter,
              default_sorts: input.default_sorts,
              filter_groups : input.filter_groups,
              group_advance_filters : input.group_advance_filters
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
              'group_advance_filters'
            ],
          },
        })
        .execute();

      if (!success) {
        throw new Error(message);
      }


      // update data on redis
      if (application!== 'grid' ||!mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
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
            advance_filters: input.default_filter,
            default_sorts: input.default_sorts,
            default_filter : input.default_filter,
            filter_groups : input.filter_groups,
            group_advance_filters : input.group_advance_filters
          };
        }
        return tab;
      });
      await ctx.redisClient.cacheData(_tabMenuId, updatedTab);
      return data;
    }),

  removeGridFilter: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const headerList = headers();
      const gridTabId = headerList.get('x-grid-tab-id') || '';
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');

      const token = ctx?.token.value;

      // drop by
      await ctx.dnaClient
        .delete(input.id, {
          is_permanent: false,
          entity: ENTITY,
          token,
          mutation: {
            params: {
              status: 'Archived',
            },
          },
        })
        .execute();

      // remove from redis
      if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');

      const filter_id = ulid();

      let filter : any = {}
      // if the tab duplicated is default it should not fetch from database and create
      // new record
      if(input.tab.default) {

        const { data, message, success, errors } = await ctx.dnaClient
         .create({
            entity: ENTITY,
            token,
            mutation: {
              params: {
                id: filter_id,
                name: `${input.tab.name} (Copy)`,
                grid_id: '',
                contact_id: id,
                link: `/portal/${mainEntity}/${application}?filter_id=${filter_id}`,
                is_current: false,
                is_default: false,
                entity: mainEntity,
                columns: input.tab.columns || [],
                groups: input.tab.groups || [],
                sorts: input.tab.sorts || [],
                advance_filters: input.tab.default_filter || [],
                default_sorts: input.tab.default_sorts  || [],
                filter_groups : input.tab.filter_groups || [],
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
                'filter_groups'
              ],
            },
          })
         .execute();

        if (!success) {
          throw new Error(message);
        }

        filter = data[0] || {};
      }else{
        // fetch and copy the data from the grid_filter
        const { data : grid_filter_data } = await ctx.dnaClient
          .findOne(input.tab.id, {
            entity: ENTITY,
            token: ctx.token.value,
            query: {
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
                'group_advance_filters',
              ],
            },
          })
          .execute();
  
        if (!grid_filter_data.length) {
          throw new Error('Grid filter not found');
        }

        const grid_filter = grid_filter_data[0] || {};
        // create a new grid_filter
        const {
          data: newData,
          message,
          success,
          errors,
        } = await ctx.dnaClient
          .create({
            entity: ENTITY,
            token,
            mutation: {
              params: {
                id: filter_id,
                name: `${grid_filter.name} (Copy)`,
                grid_id: '',
                contact_id: id,
                link: `/portal/${mainEntity}/${application}?filter_id=${filter_id}`,
                is_current: false,
                is_default: false,
                entity: mainEntity,
                columns: grid_filter.columns,
                groups: grid_filter.groups,
                sorts: grid_filter.sorts,
                advance_filters: grid_filter.advance_filters,
                default_sorts: grid_filter.default_sorts,
                filter_groups : grid_filter.filter_groups,
                group_advance_filters: grid_filter.group_advance_filters,
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
              ],
            },
          })
          .execute();
  
        if (!success) {
          throw new Error(message);
        }

        filter = newData[0] || {};
      }

      // insert to redis
      if (application !== 'grid' || !mainEntity) return [];
      const _tabMenuId = tabMenuId({
        _mainEntity: mainEntity || '',
        _application: application || '',
        _id: ctx.session.account.contact.id,
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
        default_filter : filter?.advance_filters,
        filter_groups : filter?.filter_groups,
        group_advance_filters: filter?.group_advance_filters,
      });
      await ctx.redisClient.cacheData(_tabMenuId, tabs);

      return filter?.link;
    }),
});
