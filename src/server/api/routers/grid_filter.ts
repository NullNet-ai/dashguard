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
  id: z.string().ulid().optional(),
});

const gridFilterSchema = z.object({
  name: z.string().min(1),
  default_filter: z.array(filterCriteriaSchema),
  sorts: z.array(sortSchema),
  groups: z.array(groupSchema).optional(),
  columns: z.array(columnSchema),
  default_sorts: z.array(sortSchema),
  id: z.string().ulid().optional(),
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
            ],
          },
        })
        .execute();

      console.error('RESPONSE', {
        data,
        message,
        success,
        errors,
      });

      if (!success) {
        throw new Error(message);
      }
      return data;
    }),

  updateGridFilter: privateProcedure
    .input(gridFilterSchema)
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;

      const { data, message, success, errors } = await ctx.dnaClient
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
            ],
          },
        })
        .execute();

      if (!success) {
        throw new Error(message);
      }

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
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx?.token.value;
      const id = ctx?.session?.account?.contact?.id;
      const headerList = headers();
      const pathName = headerList.get('x-pathname') || '';
      const [, , mainEntity, application] = pathName.split('/');

      const filter_id = ulid();

      // fetch and copy the data from the grid_filter
      const { data } = await ctx.dnaClient
        .findOne(input.id, {
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
            ],
          },
        })
        .execute();

      if (!data.length) {
        throw new Error('Grid filter not found');
      }

      const filter = data[0] ?? {};
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
              name: `${filter.name} (Copy)`,
              grid_id: '',
              contact_id: id,
              link: `/portal/${mainEntity}/${application}?filter_id=${filter_id}`,
              is_current: false,
              is_default: false,
              entity: mainEntity,
              columns: filter.columns,
              groups: filter.groups,
              sorts: filter.sorts,
              advance_filters: filter.advance_filters,
              default_sorts: filter.default_sorts,
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
      console.error('RESPONSE', {
        data,
        message,
        success,
        errors,
      });
      if (!success) {
        throw new Error(message);
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
        id: newData?.[0]?.id,
        name: newData?.[0]?.name,
        current: false,
        href: newData?.[0]?.link,
        default: false,
        sorting: [],
      });
      await ctx.redisClient.cacheData(_tabMenuId, tabs);

      return newData?.[0]?.link;
    }),
});
