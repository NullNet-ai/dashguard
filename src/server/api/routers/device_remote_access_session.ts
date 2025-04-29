import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import { createRemoteAccess } from '~/app/api/device_remote_access_session/create_remote_access'
import { disconnectRemoteAccess } from '~/app/api/device_remote_access_session/disconnect_remote_access'
import { getRemoteAccess } from '~/app/api/device_remote_access_session/get_remote_access'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { formatString } from '~/server/utils/formatString'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

const entity = 'device_remote_access_sessions'

export const deviceRemoteAccessSessionRouter = createTRPCRouter({
  fetchDevices: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
        limit: z.number().optional(),
      }),
    )

    .query(async ({ input, ctx }) => {
      const { limit } = input
      const res = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'instance_name'],
            advance_filters: createAdvancedFilter({ status: 'Active' }),
            order: {
              limit: limit || 10,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      return res?.data?.map((item: Record<string, any>) => {
        return {
          label: item.instance_name,
          value: item.id,
        }
      })
    }
    ),
  mainGrid: privateProcedure
  // Define input using zod for validation
    .input(ZodItems)
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        advance_filters: _advance_filters = [],
        entity,
        pluck = [],
        is_case_sensitive_sorting = 'false',
      } = input

      const pluck_object = {
        contacts: ['first_name', 'last_name', 'id'],
        updated_by: ['first_name', 'last_name', 'id'],
        created_by: ['first_name', 'last_name', 'id'],
        devices: ['instance_name', 'id'],
        [pluralize(input?.entity)]: pluck,
        organization_accounts: ['contact_id', 'id', 'device_id'],
      }

      const query = ctx.dnaClient.findAll({
        entity: input?.entity,
        token: ctx.token.value,
        // @ts-expect-error - To be determined
        query: {
          pluck: input.pluck,
          track_total_records: true,
          pluck_object,
          advance_filters: [...(_advance_filters as IAdvanceFilters[])],
          order: {
            starts_at:
            // current 5 *  input.limit 50 = 250
            (input.current || 0) === 0
              ? 0
              : (input.current || 1) * (input.limit || 100)
                - (input.limit || 100),
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
                  ? formatSorting(input.sorting, entity, is_case_sensitive_sorting)
                  : [],
                concatenate_fields: [
                // {
                //   fields: ['first_name', 'last_name'],
                //   field_name: 'full_name',
                //   separator: ' ',
                //   entity: 'contacts',
                //   aliased_entity: 'created_by',
                // },
                // {
                //   fields: ['first_name', 'last_name'],
                //   field_name: 'full_name',
                //   separator: ' ',
                //   entity: 'contacts',
                //   aliased_entity: 'updated_by',
                // },
                ],
              }
            : {}),
        },
      })

      if (pluck_object) {
        query.join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'id',
            },
            from: {
              entity,
              field: 'created_by',
            },
          },
        })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'contacts',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'contact_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'organization_accounts',
                alias: 'organization_accounts_updated_by',
                field: 'id',
              },
              from: {
                entity,
                field: 'updated_by',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                alias: 'updated_by',
                entity: 'contacts',
                field: 'id',
              },
              from: {
                entity: 'organization_accounts',
                field: 'contact_id',
              },
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'devices',
                field: 'id',
              },
              from: {
                entity,
                field: 'device_id',
              },
            },
          })
      }
      const { total_count: totalCount = 1, data: items }
    = await query.execute()

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          contacts,
          devices,
          updated_by,
          remote_access_type,
          remote_access_category,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          remote_access_type,
          remote_access_category: formatString(remote_access_category),
          // type: formatString(remote_access_type),
          device_name: formatString(devices?.[0]?.instance_name),
          created_by: !!contacts?.[0]?.first_name || !!contacts?.[0]?.last_name
            ? `${contacts?.[0]?.first_name} ${contacts?.[0]?.last_name}`
            : null,
          updated_by: updated_by?.[0]?.first_name || updated_by?.[0]?.last_name
            ? `${updated_by?.[0]?.first_name} ${updated_by?.[0]?.last_name}`
            : null,
        }
      })

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / limit)
      return {
        totalCount,
        items: formatted_items,
        currentPage: current,
        totalPages,
      }
    }),

  createUpdateDeviceRemoteAccessSessions: privateProcedure
    .input(z.object({ id: z.string(), device_id: z.string(), remote_access_type: z.string(), category: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = ctx.token.value
      const { id, device_id, remote_access_type, category } = input

      if (!id) {
        const res = await ctx.dnaClient
          .create({
            entity,
            token: ctx.token.value,
            mutation: {
              params: {
                device_id,
                entity_prefix: 'RA',
                remote_access_type,
                remote_access_category: category,
                remote_access_status: 'Active',
                status: 'Active',
              },
              pluck: ['id', 'device_id', 'remote_access_type', 'code'],
            },
          })
          .execute()

        const ra_type = remote_access_type.toLowerCase() === 'console' ? 'Shell' : 'UI'

        let remote_access = await getRemoteAccess({ device_id, ra_type, token })

        if (!remote_access?.session) {
          await createRemoteAccess({ device_id, ra_type, token })
          remote_access = await getRemoteAccess({ device_id, ra_type, token })
          return { ...res, data: res?.data?.map((item) => {
            return { ...item, remote_access }
          }) }
        }

        return { ...res, data: res?.data?.map((item) => {
          return { ...item, remote_access }
        }) }
      }
      else {
        const res = await ctx.dnaClient
          .update(id, {
            entity,
            token: ctx.token.value,
            mutation: {
              params: {
                device_id,
                remote_access_type,
                remote_access_status: 'Active',
                remote_access_category: category,
                status: 'Active',
              },
              pluck: ['id', 'device_id', 'remote_access_type'],
            },
          })
          .execute()

        const ra_type = remote_access_type.toLowerCase() === 'console' ? 'Shell' : 'UI'

        const remote_access = await getRemoteAccess({ device_id, ra_type, token })

        return { ...res, data: res?.data?.map((item) => {
          return { ...item, remote_access }
        }) }
      }
    }),
  disconnectDeviceRemoteAccess: privateProcedure
    .input(z.object({ id: z.string(), device_id: z.string(), remote_access_type: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id, device_id, remote_access_type } = input
      const ra_type = remote_access_type === 'Console' ? 'Shell' : 'UI'
      await disconnectRemoteAccess({ device_id, ra_type })
      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              remote_access_status: 'Closed',
              status: 'Active',
            },
            pluck: ['id', 'device_id', 'remote_access_type'],
          },
        })
        .execute()
      return res
    }
    ),

})
