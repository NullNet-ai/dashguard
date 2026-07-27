import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { EOperator, EOrderDirection } from '@dna-platform/common-orm';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { EStatus } from '../types';
import { get_meta_header } from '~/utils/request-header';
import ZodItems from '~/server/zodSchema/grid/items';
import pluralize from 'pluralize';
import { getEntityCredentials } from '~/server/lib/root-orm';

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

  currentGroups: privateProcedure
    .input(z.object({ contact_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { contact_id } = input;

      const { token, as_root } = await getEntityCredentials(
        'device_contacts',
        ctx.dnaClient,
        ctx.token.value,
      );

      const query = ctx.dnaClient.findAll({
        entity: 'device_contacts',
        token,
        as_root,
        query: {
          pluck: ['id', 'device_id'],
          pluck_object: {
            device_groups: ['id', 'device_id', 'device_group_setting_id'],
            device_group_settings: ['id', 'name'],
          },
          advance_filters: [
            {
              type: 'criteria',
              field: 'contact_id',
              operator: EOperator.EQUAL,
              values: [contact_id],
              entity: 'device_contacts',
            },
          ],
          order: { limit: 1000 },
        },
      });

      query.join({
        type: 'left',
        field_relation: {
          from: { entity: 'device_contacts', field: 'device_id' },
          to: { entity: 'device_groups', field: 'device_id' },
        },
      })
      .nestedJoin({
        type: 'left',
        field_relation: {
          from: { entity: 'device_groups', field: 'device_group_setting_id' },
          to: { entity: 'device_group_settings', field: 'id' },
        },
      });

      const { data: items } = await query.execute();
      
      const dedupedGroups = new Map<string, string>();
      items?.forEach((item: any) => {
        // Look at root level (nestedJoin typically merges here)
        const rootSettings = Array.isArray(item?.device_group_settings)
          ? item.device_group_settings
          : item?.device_group_settings
            ? [item.device_group_settings]
            : [];
            
        rootSettings.forEach((setting: any) => {
          if (setting?.id && setting?.name) {
            dedupedGroups.set(setting.id, setting.name);
          }
        });

        // Look at nested level (fallback)
        item?.device_groups?.forEach((dg: any) => {
          const setting = Array.isArray(dg?.device_group_settings) ? dg?.device_group_settings?.[0] : dg?.device_group_settings;
          if (setting?.id && setting?.name) {
            dedupedGroups.set(setting.id, setting.name);
          }
        });
      });

      return Array.from(dedupedGroups.entries()).map(([value, label]) => ({
        value,
        label,
      }));
    }),

  setDeviceGroups: privateProcedure
    .input(
      z.object({
        contact_id: z.string().min(1),
        group_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();
      const { contact_id, group_ids } = input;

      const currentGroupsQuery = ctx.dnaClient.findAll({
        entity: 'device_contacts',
        token: ctx.token.value,
        query: {
          pluck: ['id', 'device_id'],
          pluck_object: {
            device_groups: ['id', 'device_id', 'device_group_setting_id'],
          },
          advance_filters: [
            {
              type: 'criteria',
              field: 'contact_id',
              operator: EOperator.EQUAL,
              values: [contact_id],
              entity: 'device_contacts',
            },
          ],
          order: { limit: 1000 },
        },
      });

      currentGroupsQuery.join({
        type: 'left',
        field_relation: {
          from: { entity: 'device_contacts', field: 'device_id' },
          to: { entity: 'device_groups', field: 'device_id' },
        },
      });

      const { data: items } = await currentGroupsQuery.execute();
      const currentDeviceContacts = items || [];
      const previousSelection = new Set<string>();
      
      currentDeviceContacts.forEach((item: any) => {
        item?.device_groups?.forEach((dg: any) => {
          if (dg.device_group_setting_id) {
            previousSelection.add(dg.device_group_setting_id);
          }
        });
      });

      const added = group_ids.filter((id) => !previousSelection.has(id));
      const removed = Array.from(previousSelection).filter((id) => !group_ids.includes(id));

      const existingAssignedSet = new Set(currentDeviceContacts.map((c: any) => c.device_id));
      
      const createPromises: Promise<any>[] = [];
      for (const id of added) {
        const query = ctx.dnaClient.findAll({
          entity: 'device_groups',
          token: ctx.token.value,
          query: {
            pluck: ['device_id'],
            order: { limit: 10000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_group_setting_id',
                operator: EOperator.EQUAL,
                values: [id],
                entity: 'device_groups',
              },
              { type: 'operator', operator: EOperator.AND },
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: [EStatus.ACTIVE],
                entity: 'device_groups',
              },
            ],
          },
        });
        const { data: devices } = await query.execute();
        (devices || []).forEach((row: any) => {
          if (!existingAssignedSet.has(row.device_id)) {
            existingAssignedSet.add(row.device_id);
            createPromises.push(
              ctx.dnaClient
                .create({
                  entity: 'device_contacts',
                  token: ctx.token.value,
                  ...meta_header,
                  mutation: {
                    pluck: ['id'],
                    params: {
                      contact_id,
                      device_id: row.device_id,
                      status: EStatus.ACTIVE,
                    },
                  },
                })
                .execute()
            );
          }
        });
      }

      const deletePromises: Promise<any>[] = [];
      for (const id of removed) {
        const query = ctx.dnaClient.findAll({
          entity: 'device_groups',
          token: ctx.token.value,
          query: {
            pluck: ['device_id'],
            order: { limit: 10000 },
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_group_setting_id',
                operator: EOperator.EQUAL,
                values: [id],
                entity: 'device_groups',
              },
              { type: 'operator', operator: EOperator.AND },
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: [EStatus.ACTIVE],
                entity: 'device_groups',
              },
            ],
          },
        });
        const { data: devices } = await query.execute();
        
        for (const row of (devices || [])) {
          if (group_ids.length > 0) {
            const checkQuery = ctx.dnaClient.findAll({
              entity: 'device_groups',
              token: ctx.token.value,
              query: {
                pluck: ['id'],
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'device_id',
                    operator: EOperator.EQUAL,
                    values: [row.device_id],
                    entity: 'device_groups',
                  },
                  { type: 'operator', operator: EOperator.AND },
                  {
                    type: 'criteria',
                    field: 'device_group_setting_id',
                    operator: EOperator.EQUAL,
                    values: group_ids,
                    entity: 'device_groups',
                  },
                ],
              }
            });
            const { data: checkData } = await checkQuery.execute();
            if (checkData && checkData.length > 0) {
              continue; 
            }
          }
          
          const deviceContact = currentDeviceContacts.find((c: any) => c.device_id === row.device_id);
          if (deviceContact) {
            deletePromises.push(
              ctx.dnaClient
                .delete(deviceContact.id, {
                  entity: 'device_contacts',
                  token: ctx.token.value,
                })
                .execute()
            );
            existingAssignedSet.delete(row.device_id);
            const index = currentDeviceContacts.findIndex((c: any) => c.id === deviceContact.id);
            if (index > -1) {
              currentDeviceContacts.splice(index, 1);
            }
          }
        }
      }

      await Promise.all([...createPromises, ...deletePromises]);
      return { success: true };
    }),

  assignGroups: privateProcedure
    .input(
      z.object({
        contact_id: z.string().min(1),
        group_ids: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const meta_header = await get_meta_header();
      const { contact_id, group_ids } = input;

      const assigned = await ctx.dnaClient
        .findAll({
          entity: 'device_contacts',
          token: ctx.token.value,
          query: {
            pluck: ['device_id'],
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
      const assignedSet = new Set(assignedDeviceIds);

      const deviceIdsToAssign = new Set<string>();

      for (const group_id of group_ids) {
        const query = ctx.dnaClient.findAll({
          entity: 'device_groups',
          token: ctx.token.value,
          query: {
            pluck: ['device_id'],
            advance_filters: [
              {
                type: 'criteria',
                field: 'device_group_setting_id',
                operator: EOperator.EQUAL,
                values: [group_id],
                entity: 'device_groups',
              },
              { type: 'operator', operator: EOperator.AND },
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: [EStatus.ACTIVE],
                entity: 'device_groups',
              },
            ],
          },
        });

        const { data: devices } = await query.execute();
        (devices || []).forEach((row: any) => {
          if (!assignedSet.has(row.device_id)) {
            deviceIdsToAssign.add(row.device_id);
          }
        });
      }

      const results = await Promise.all(
        Array.from(deviceIdsToAssign).map((device_id) =>
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

  unassignGroups: privateProcedure
    .input(z.object({ contact_device_group_ids: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const { contact_device_group_ids } = input;

      const { token: mutateToken, as_root } = await getEntityCredentials(
        'contact_device_groups',
        ctx.dnaClient,
        ctx.token.value,
      );

      await Promise.all(
        contact_device_group_ids.map((id) =>
          ctx.dnaClient
            .delete(id, {
              entity: 'contact_device_groups',
              token: mutateToken,
              as_root,
            })
            .execute(),
        ),
      );

      return { success: true };
    }),
});
