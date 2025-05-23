import { EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import { createRemoteAccess } from '~/app/api/device_remote_access_session/create_remote_access'
import { disconnectRemoteAccess } from '~/app/api/device_remote_access_session/disconnect_remote_access'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { formatString } from '~/server/utils/formatString'
import { pluralize } from '~/server/utils/pluralize'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import ZodItems from '~/server/zodSchema/grid/items'

const entity = 'device_remote_access_sessions'
const remote_type = ['console', 'shell']

export const deviceRemoteAccessSessionRouter = createTRPCRouter({
  fetchDevices: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        code: z.string().optional(),
        limit: z.number().optional(),
        device_id: z.string().optional()
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, device_id } = input
      const res = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'instance_name', 'device_status'],
            advance_filters: createAdvancedFilter( !!device_id ? { id: device_id } : { status: 'Active' , device_status: 'Online'}),
            order: {
              limit: limit || 10,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()
      
      const res_data = res?.data?.map((item: Record<string, any>) => {
        return {
          label: item.instance_name,
          value: item.id,
          device_status: item.device_status
        }
      })
      
      return res_data
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
        pluck = [],
        sorting = [],
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
        query: {
          track_total_records: true,
          pluck: input.pluck,
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
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
          //@ts-expect-error - multiple sort
            multiple_sort:
            sorting?.length
              ? formatSorting(sorting, entity, is_case_sensitive_sorting)
              : [],
            date_format: 'YYYY/MM/DD',
            concatenate_fields: [
            {
              fields: ['first_name', 'last_name'],
              field_name: 'contact_created_by',
              separator: ' ',
              entity: 'contacts',
              aliased_entity: 'created_by',
            },
            {
              fields: ['first_name', 'last_name'],
              field_name: 'contact_updated_by',
              separator: ' ',
              entity: 'contacts',
              aliased_entity: 'updated_by',
            },
            ],
              
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
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          device_remote_access_type: remote_access_type.toLowerCase() === 'shell' ? 'Console' : 'Web Interface',
          remote_access_type,
          // remote_access_category: formatString(remote_access_type),
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
    .input(z.object({ id: z.string().optional(), device_id: z.string(), remote_access_type: z.string(), category: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = ctx.token.value
      const { device_id, remote_access_type } = input
      const ra_type = remote_type.includes(remote_access_type.toLowerCase()) ? 'Shell' : 'UI'
        const res = await ctx.dnaClient.findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck: ['id', 'status', 'remote_access_session'],
            advance_filters: createAdvancedFilter({ device_id, remote_access_status: 'active', remote_access_type: ra_type }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()
        
        
        
        if (!res?.data?.length) {
          await createRemoteAccess({ device_id, ra_type, token })
          
          return await ctx.dnaClient.findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: ['id', 'status', 'remote_access_session'],
              advance_filters: createAdvancedFilter({ device_id, remote_access_status: 'active' }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()
        }

        return res
    }),
  disconnectDeviceRemoteAccess: privateProcedure
    .input(z.object({ id: z.string(), device_id: z.string(), remote_access_type: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const {  device_id, remote_access_type } = input
      
      const ra_type = remote_type.includes(remote_access_type.toLowerCase()) ? 'Shell' : 'UI'


      const res = await disconnectRemoteAccess({ device_id, ra_type, token: ctx.token.value })
        
    }
    ),

})
