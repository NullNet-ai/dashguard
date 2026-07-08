import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { EStatus } from '../types';
import { get_meta_header } from '~/utils/request-header';
import ZodItems from '~/server/zodSchema/grid/items';
import pluralize from 'pluralize';

const entity = 'device_contacts';

export const contactDeviceRouter = createTRPCRouter({
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

    const query = ctx.dnaClient.findAll({
      entity: baseEntity,
      token: ctx.token.value,
      query: {
        pluck: input.pluck,
        track_total_records: true,
        pluck_object: {
          devices: ['id', 'code', 'device_name', 'status'],
          [pluralEntity]: input.pluck,
        },
        advance_filters: _advance_filters as any[],
        order: {
          starts_at:
            (current || 0) === 0
              ? 0
              : (current || 1) * (limit || 100) - (limit || 100),
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
        from: { entity: baseEntity, field: 'device_id' },
        to: { entity: 'devices', field: 'id' },
      },
    });

    const { total_count: totalCount = 1, data: items } = await query.execute();
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
    .input(ZodItems.extend({ contact_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { contact_id, limit = 50, current = 1, sorting = [] } = input;

      // Find already-assigned device_ids for this contact
      const assigned = await ctx.dnaClient
        .findAll({
          entity: 'device_contacts',
          token: ctx.token.value,
          query: {
            pluck: ['device_id'],
            order: { limit: 1000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'contact_id',
                operator: EOperator.EQUAL,
                values: [contact_id],
                entity: 'device_contacts',
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

      const query = ctx.dnaClient.findAll({
        entity: 'devices',
        token: ctx.token.value,
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

  assign: privateProcedure
    .input(
      z.object({
        contact_id: z.string().min(1),
        device_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();
      const { contact_id, device_ids } = input;

      const results = await Promise.all(
        device_ids.map((device_id) =>
          ctx.dnaClient
            .create({
              entity: 'device_contacts',
              token: ctx.token.value,
              ...meta_header,
              mutation: {
                pluck: ['id'],
                params: {
                  contact_id,
                  device_id,
                  status: EStatus.ACTIVE,
                },
              },
            })
            .execute(),
        ),
      );

      return results;
    }),

  unassign: privateProcedure
    .input(z.object({ device_contact_ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const { device_contact_ids } = input;

      await Promise.all(
        device_contact_ids.map((id) =>
          ctx.dnaClient
            .delete(id, {
              entity: 'device_contacts',
              token: ctx.token.value,
            })
            .execute(),
        ),
      );

      return { success: true };
    }),
});
