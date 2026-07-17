import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { EStatus } from '../types';
import { get_meta_header } from '~/utils/request-header';
import ZodItems from '~/server/zodSchema/grid/items';
import { getEntityCredentials, createRootOrm } from '~/server/lib/root-orm';
import pluralize from 'pluralize';
import {
  addCommonGridJoins,
  addCommonGridPluckObject,
  addCommonGridConcatenates,
} from '~/server/utils/queryBuilder';

const entity = 'device_group_settings';

export const deviceGroupRouter = createTRPCRouter({
  ...createDefineRoutes(entity),

  mainGrid: privateProcedure.input(ZodItems).query(async ({ input, ctx }) => {
    const {
      limit = 50,
      current = 1,
      advance_filters: _advance_filters = [],
      entity: inputEntity,
      sorting = [],
    } = input;

    const baseEntity = inputEntity || entity;
    const pluralEntity = pluralize(baseEntity);

    const { token: queryToken, as_root } = await getEntityCredentials(
      baseEntity,
      ctx.dnaClient,
      ctx.token.value,
    );

    const query = ctx.dnaClient.findAll({
      entity: baseEntity,
      token: queryToken,
      as_root,
      query: {
        pluck: input.pluck,
        track_total_records: true,
        pluck_object: {
          ...addCommonGridPluckObject(),
          [pluralEntity]: input.pluck,
        },
        advance_filters: _advance_filters as any[],
        concatenate_fields: [...addCommonGridConcatenates(pluralEntity)],
        order: {
          starts_at:
            (current || 0) === 0
              ? 0
              : (current || 1) * (limit || 100) - (limit || 100),
          limit: limit || 50,
          by_field:
            sorting?.length === 1
              ? ((sorting[0] as any)?.sort_key ?? sorting[0]?.id)
              : 'name',
          by_direction:
            sorting?.length === 1 && sorting[0]?.desc
              ? EOrderDirection.DESC
              : EOrderDirection.ASC,
        },
      },
    });
    addCommonGridJoins(query, baseEntity);

    const { total_count: totalCount = 1, data: items } = await query.execute();
    const totalPages = Math.ceil(totalCount / (limit || 50));

    const formatted_items = items?.map((item: Record<string, any>) => {
      let {
        [pluralEntity]: entity_data,
        created_by,
        updated_by,
        ...rest
      } = item;
      if (Array.isArray(created_by)) created_by = created_by?.[0];
      if (Array.isArray(updated_by)) updated_by = updated_by?.[0];
      return {
        ...entity_data,
        ...rest,
        created_by: created_by?.full_name ?? '',
        updated_by: updated_by?.full_name ?? '',
      };
    });

    return {
      totalCount,
      items: formatted_items || [],
      currentPage: current,
      totalPages,
    };
  }),

  members: privateProcedure
    .input(ZodItems.extend({ device_group_setting_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const {
        device_group_setting_id,
        limit = 50,
        current = 1,
        sorting = [],
      } = input;

      const { token: queryToken, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      const query = ctx.dnaClient.findAll({
        entity: 'device_groups',
        token: queryToken,
        as_root,
        query: {
          pluck: input.pluck,
          track_total_records: true,
          pluck_object: {
            devices: ['id', 'code', 'device_name', 'status'],
            device_groups: input.pluck || ['id', 'device_id'],
          },
          advance_filters: [
            {
              type: 'criteria',
              field: 'device_group_setting_id',
              operator: EOperator.EQUAL,
              values: [device_group_setting_id],
              entity: 'device_groups',
            },
          ],
          order: {
            starts_at:
              (current || 0) === 0
                ? 0
                : (current || 1) * (limit || 50) - (limit || 50),
            limit: limit || 50,
            by_field:
              sorting?.length === 1
                ? ((sorting[0] as any)?.sort_key ?? sorting[0]?.id)
                : 'devices.device_name',
            by_direction:
              sorting?.length === 1 && sorting[0]?.desc
                ? EOrderDirection.DESC
                : EOrderDirection.ASC,
          },
        },
      });

      query.join({
        type: 'left',
        field_relation: {
          from: { entity: 'device_groups', field: 'device_id' },
          to: { entity: 'devices', field: 'id' },
        },
      });

      const { total_count: totalCount = 1, data: items } =
        await query.execute();
      const totalPages = Math.ceil(totalCount / (limit || 50));

      const formatted_items = items?.map((item: Record<string, any>) => ({
        ...item,
        device_name: item?.devices?.[0]?.device_name,
        device_code: item?.devices?.[0]?.code,
        device_status: item?.devices?.[0]?.status,
      }));

      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      };
    }),

  assignableDevices: privateProcedure
    .input(ZodItems.extend({ device_group_setting_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const {
        device_group_setting_id,
        limit = 50,
        current = 1,
        sorting = [],
      } = input;

      const { token: queryToken, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      // Find already-assigned device_ids for this group
      const assigned = await ctx.dnaClient
        .findAll({
          entity: 'device_groups',
          token: queryToken,
          as_root,
          query: {
            pluck: ['device_id'],
            order: { limit: 1000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_group_setting_id',
                operator: EOperator.EQUAL,
                values: [device_group_setting_id],
                entity: 'device_groups',
              },
            ],
          },
        })
        .execute();

      const assignedDeviceIds =
        assigned.data?.map((row: any) => row.device_id) ?? [];

      // Query all devices, excluding assigned ones
      const advance_filters: any[] = [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: [EStatus.ACTIVE],
          entity: 'devices',
        },
      ];

      if (assignedDeviceIds.length > 0) {
        advance_filters.push(
          { type: 'operator', operator: EOperator.AND },
          {
            type: 'criteria',
            field: 'id',
            operator: EOperator.NOT_EQUAL,
            values: assignedDeviceIds,
            entity: 'devices',
          },
        );
      }

      const { token: deviceToken, as_root: deviceAsRoot } =
        await getEntityCredentials('devices', ctx.dnaClient, ctx.token.value);

      const query = ctx.dnaClient.findAll({
        entity: 'devices',
        token: deviceToken,
        as_root: deviceAsRoot,
        query: {
          pluck: input.pluck || ['id', 'code', 'device_name'],
          track_total_records: true,
          advance_filters,
          order: {
            starts_at:
              (current || 0) === 0
                ? 0
                : (current || 1) * (limit || 50) - (limit || 50),
            limit: limit || 50,
            by_field:
              sorting?.length === 1
                ? ((sorting[0] as any)?.sort_key ?? sorting[0]?.id)
                : 'device_name',
            by_direction:
              sorting?.length === 1 && sorting[0]?.desc
                ? EOrderDirection.DESC
                : EOrderDirection.ASC,
          },
        },
      });

      const { total_count: totalCount = 1, data: items } =
        await query.execute();
      const totalPages = Math.ceil(totalCount / (limit || 50));

      return { totalCount, items, currentPage: current, totalPages };
    }),

  assignDevices: privateProcedure
    .input(
      z.object({
        device_group_setting_id: z.string().min(1),
        device_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();
      const { device_group_setting_id, device_ids } = input;

      const { token: mutateToken, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      const results = await Promise.all(
        device_ids.map((device_id) =>
          ctx.dnaClient
            .create({
              entity: 'device_groups',
              token: mutateToken,
              as_root,
              ...meta_header,
              mutation: {
                pluck: ['id'],
                params: {
                  device_id,
                  device_group_setting_id,
                  status: EStatus.ACTIVE,
                },
              },
            })
            .execute(),
        ),
      );

      return results;
    }),

  unassignDevices: privateProcedure
    .input(z.object({ device_group_ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const { device_group_ids } = input;

      const { token: mutateToken, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      await Promise.all(
        device_group_ids.map((id) =>
          ctx.dnaClient
            .delete(id, {
              entity: 'device_groups',
              token: mutateToken,
              as_root,
            })
            .execute(),
        ),
      );

      return { success: true };
    }),

  saveDeviceGroup: privateProcedure
    .input(z.object({ id: z.string().optional(), name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const { name, id } = input;
      const meta_header = await get_meta_header();

      const { token, as_root } = await getEntityCredentials(
        entity,
        ctx.dnaClient,
        ctx.token.value,
      );

      const existing = await ctx.dnaClient
        .findAll({
          entity,
          token,
          as_root,
          query: {
            pluck: ['id', 'status'],
            advance_filters: [
              ...createAdvancedFilter({ name }),
              ...(id
                ? [
                    { operator: EOperator.AND, type: 'operator' },
                    {
                      field: 'id',
                      operator: EOperator.NOT_EQUAL,
                      type: 'criteria',
                      values: [id],
                    },
                  ]
                : []),
            ],
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (existing?.data?.length) {
        const [row] = existing.data;
        const { id: existing_id, status } = row || {};
        return {
          message: 'Device group already exists.',
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          existing: true,
          existing_record: { id: existing_id, status },
          errors: {
            form: [{ field: 'name', message: 'Device group already exists.' }],
          },
        };
      }

      if (!id) {
        const record = await ctx.dnaClient
          .create({
            entity,
            token,
            as_root,
            ...meta_header,
            mutation: {
              params: { status: EStatus.DRAFT, name },
              pluck: ['id', 'code', 'name'],
            },
          })
          .execute();

        return record;
      }

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token,
          as_root,
          ...meta_header,
          mutation: {
            params: { name },
            pluck: ['id', 'code', 'name'],
          },
        })
        .execute();

      return res;
    }),

  saveCategoryDetails: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        categories: z.string().min(1),
        entity: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, categories, entity: category_entity } = input;
      const meta_header = await get_meta_header();

      const { token, as_root } = await getEntityCredentials(
        entity,
        ctx.dnaClient,
        ctx.token.value,
      );

      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token,
          as_root,
          ...meta_header,
          mutation: {
            params: {
              categories: [categories],
              entity: category_entity,
            },
          },
        })
        .execute();

      return res;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();

      const { token, as_root } = await getEntityCredentials(
        entity,
        ctx.dnaClient,
        ctx.token.value,
      );

      const groups = await ctx.dnaClient
        .findAll({
          entity,
          token,
          as_root,
          query: {
            pluck: ['id', 'status'],
            advance_filters: createAdvancedFilter({ name: input.name }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (groups.data.length > 0 && groups?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = groups?.data[0] || {};
        return {
          message: 'Device group already exists',
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          existing: true,
          existing_record: { id: existing_id, status },
          errors: {
            form: [{ field: 'name', message: 'Device group already exists.' }],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity,
          token,
          as_root,
          ...meta_header,
          mutation: {
            params: { name: input.name },
          },
        })
        .execute();

      return res;
    }),

  assignableGroupsForDevice: privateProcedure
    .input(z.object({ device_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { device_id } = input;

      const { token: joinToken, as_root: joinAsRoot } =
        await getEntityCredentials(
          'device_groups',
          ctx.dnaClient,
          ctx.token.value,
        );

      // Find groups already assigned to this device
      const assigned = await ctx.dnaClient
        .findAll({
          entity: 'device_groups',
          token: joinToken,
          as_root: joinAsRoot,
          query: {
            pluck: ['device_group_setting_id'],
            order: { limit: 1000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_id',
                operator: EOperator.EQUAL,
                values: [device_id],
                entity: 'device_groups',
              },
            ],
          },
        })
        .execute();

      const assignedGroupIds =
        assigned.data?.map((row: any) => row.device_group_setting_id) ?? [];

      const advance_filters: any[] = [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: [EStatus.ACTIVE],
          entity: 'device_group_settings',
        },
      ];

      if (assignedGroupIds.length > 0) {
        advance_filters.push(
          { type: 'operator', operator: EOperator.AND },
          {
            type: 'criteria',
            field: 'id',
            operator: EOperator.NOT_EQUAL,
            values: assignedGroupIds,
            entity: 'device_group_settings',
          },
        );
      }

      const { token: groupToken, as_root: groupAsRoot } =
        await getEntityCredentials(entity, ctx.dnaClient, ctx.token.value);

      const query = ctx.dnaClient.findAll({
        entity,
        token: groupToken,
        as_root: groupAsRoot,
        query: {
          pluck: ['id', 'name', 'code'],
          track_total_records: true,
          advance_filters,
          order: {
            limit: 500,
            by_field: 'name',
            by_direction: EOrderDirection.ASC,
          },
        },
      });

      const { data: items } = await query.execute();
      return items || [];
    }),

  assignedGroupsForDevice: privateProcedure
    .input(z.object({ device_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { device_id } = input;

      const { token, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      const query = ctx.dnaClient.findAll({
        entity: 'device_groups',
        token,
        as_root,
        query: {
          pluck: ['id', 'device_group_setting_id'],
          pluck_object: {
            device_group_settings: ['id', 'name', 'status'],
          },
          advance_filters: [
            {
              type: 'criteria',
              field: 'device_id',
              operator: EOperator.EQUAL,
              values: [device_id],
              entity: 'device_groups',
            },
          ],
        },
      });

      query.join({
        type: 'left',
        field_relation: {
          from: { entity: 'device_groups', field: 'device_group_setting_id' },
          to: { entity: 'device_group_settings', field: 'id' },
        },
      });

      const { data: items } = await query.execute();

      return (
        items?.map((item: any) => ({
          device_group_id: item.id,
          device_group_setting_id: item.device_group_setting_id,
          name: item?.device_group_settings?.[0]?.name,
        })) || []
      );
    }),

  setDeviceGroups: privateProcedure
    .input(
      z.object({
        device_id: z.string().min(1),
        group_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();
      const { device_id, group_ids } = input;

      const { token, as_root } = await getEntityCredentials(
        'device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      // Read the device's current group memberships
      const current = await ctx.dnaClient
        .findAll({
          entity: 'device_groups',
          token,
          as_root,
          query: {
            pluck: ['id', 'device_group_setting_id'],
            order: { limit: 1000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_id',
                operator: EOperator.EQUAL,
                values: [device_id],
                entity: 'device_groups',
              },
            ],
          },
        })
        .execute();

      const currentRows = (current.data ?? []) as Array<{
        id: string;
        device_group_setting_id: string;
      }>;
      const currentGroupIds = currentRows.map(
        (row) => row.device_group_setting_id,
      );

      const toCreate = group_ids.filter(
        (gid) => !currentGroupIds.includes(gid),
      );
      const toDelete = currentRows.filter(
        (row) => !group_ids.includes(row.device_group_setting_id),
      );

      await Promise.all([
        ...toCreate.map((device_group_setting_id) =>
          ctx.dnaClient
            .create({
              entity: 'device_groups',
              token,
              as_root,
              ...meta_header,
              mutation: {
                pluck: ['id'],
                params: {
                  device_id,
                  device_group_setting_id,
                  status: EStatus.ACTIVE,
                },
              },
            })
            .execute(),
        ),
        ...toDelete.map((row) =>
          ctx.dnaClient
            .delete(row.id, {
              entity: 'device_groups',
              token,
              as_root,
            })
            .execute(),
        ),
      ]);

      return { success: true };
    }),
});
