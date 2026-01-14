import { EDateFormats, EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { uniqBy } from 'lodash'
import { z } from 'zod'

import { createRemoteAccess } from '~/app/api/device_remote_access_session/create_remote_access'
import { disconnectRemoteAccess } from '~/app/api/device_remote_access_session/disconnect_remote_access'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { formatString } from '~/server/utils/formatString'
import { pluralize } from '~/server/utils/pluralize'
import { addCommonGridJoins, addCommonGridPluckObject } from '~/server/utils/queryBuilder'
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
        device_id: z.string().optional(),
        device_code: z.string().optional()
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, device_id, device_code } = input
      const res = await ctx.dnaClient
        .findAll({
          entity: 'devices',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'device_name', 'is_device_online'],
            advance_filters: createAdvancedFilter( !!device_id ? { id: device_id } : !!device_code ? { code: device_code } : { status: 'Active' , is_device_online: true}),
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
          label: item.device_name,
          value: item.id,
          is_device_online: item.is_device_online
        }
      })
      
      return res_data
    }
    ),
  fetchDeviceRemoteAccess: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        device_code: z.string().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, device_id, device_code } = input
      let realDeviceId = device_id
      if (device_code) {
        const device = await ctx.dnaClient
          .findAll({
            entity: 'devices',
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: device_code }),
            },
          })
          .execute()
        realDeviceId = device?.data?.[0]?.id || ''
      }

      const res = await ctx.dnaClient
        .findAll({
          entity: 'device_remote_access_sessions',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'code', 'remote_access_session', 'remote_access_type'],
            advance_filters: createAdvancedFilter({ device_id: realDeviceId }),
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
          label: `${item.code} - ${item.remote_access_type}`,
          value: item.id,
          device_id: realDeviceId,
          remote_access_session: item.remote_access_session,
          remote_access_type: item.remote_access_type
        }
      })
      
      return res_data
    }
    ),
  fetchDeviceServices: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        device_code: z.string().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, device_id, device_code } = input
      let realDeviceId = device_id
      if (device_code) {
        const device = await ctx.dnaClient
          .findAll({
            entity: 'devices',
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: device_code }),
            },
          })
          .execute()
        realDeviceId = device?.data?.[0]?.id || ''
      }

      const res = await ctx.dnaClient
        .findAll({
          entity: 'device_services',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'address', 'port', 'protocol', 'program'],
            advance_filters: createAdvancedFilter({ device_id: realDeviceId }),
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
          label: `${item.protocol}://${item.address}:${item.port}`,
          value: item.id,
          item
        }
      })
      
      return uniqBy(res_data, 'label')
    }
    ),
  mainGrid: privateProcedure
  // Define input using zod for validation
    .input(ZodItems.merge(z.object({ device_code: z.string().optional() })))
    .query(async ({ input, ctx }) => {
      const {
        limit = 50,
        current = 1,
        pluck = [],
        sorting = [],
        // @ts-expect-error - No type yet
        is_case_sensitive_sorting = 'false',
        device_code,
      } = input
      let { advance_filters: _advance_filters = [] } = input
      
      if (device_code) {
        const deviceRes = await ctx.dnaClient
          .findAll({
            entity: 'devices',
            token: ctx.token.value,
            query: {
              pluck: ['id'],
              advance_filters: createAdvancedFilter({ code: device_code }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()

        const deviceId = deviceRes?.data?.[0]?.id as string | undefined
        if (!deviceId) {
          return {
            totalCount: 0,
            items: [],
            currentPage: current,
            totalPages: 1,
          }
        }

        let replacedDeviceIdFilter = false
        _advance_filters = (_advance_filters as IAdvanceFilters[]).map((filter) => {
          if (filter?.type === 'criteria' && filter?.field === 'device_id') {
            replacedDeviceIdFilter = true
            return {
              ...filter,
              values: [deviceId],
            }
          }
          return filter
        })

        if (!replacedDeviceIdFilter) {
          const hasExistingFilters = (_advance_filters as IAdvanceFilters[]).length > 0
          _advance_filters = [
            ...(_advance_filters as IAdvanceFilters[]),
            ...(hasExistingFilters
              ? [{ type: 'operator', operator: EOperator.AND } as IAdvanceFilters]
              : []),
            ...(createAdvancedFilter({ device_id: deviceId }) as IAdvanceFilters[]),
          ]
        }
      }

      const pluck_object = {
        ...addCommonGridPluckObject(),
        devices: ['device_name', 'id'],
        [pluralize(input?.entity)]: pluck,
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
          // multiple_sort:
          //   sorting?.length
          //     ? formatSorting(sorting, entity, is_case_sensitive_sorting)
          //     : [],
            date_format: 'YYYY/mm/dd' as EDateFormats,
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
        query
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

      addCommonGridJoins(query, 'device_remote_access_sessions')
      const { total_count: totalCount = 1, data: items }
      = await query.execute()

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          devices,
          updated_by,
          ...rest
        } = item

        return {
          ...entity_data,
          ...rest,
          device_remote_access_type: entity_data?.remote_access_type,
          // remote_access_category: formatString(remote_access_type),
          // type: formatString(remote_access_type),
          device_name: formatString(devices?.device_name),
          created_by: !!created_by?.first_name || !!created_by?.last_name
            ? `${created_by?.first_name} ${created_by?.last_name}`
            : null,
          updated_by: updated_by?.first_name || updated_by?.last_name
            ? `${updated_by?.first_name} ${updated_by?.last_name}`
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
    .input(z.object({ id: z.string().optional(), device_id: z.string(), remote_access_type: z.string(), category: z.string(), device_service_id: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const token = ctx.token.value
      const { device_id, remote_access_type, device_service_id } = input

      const response = await ctx.dnaClient
        .findAll({
          entity: 'device_instances',
          token: ctx.token.value,
          query: {
            pluck: ['id'],
            advance_filters: createAdvancedFilter({ device_id, status: 'Active' }),
          },
        })
        .execute();
        

      const instanceId = response?.data?.[response?.data?.length > 1 ? response?.data?.length - 1 : 0]?.id; 

      const ra_type = remote_access_type
        
      const {
        data: {
          session_token
        }
      } = await createRemoteAccess({ device_id, ra_type, token, instanceId , device_service_id })
          
          return await ctx.dnaClient.findAll({
            entity,
            token: ctx.token.value,
            query: {
              pluck: ['id', 'status', 'remote_access_session'],
              advance_filters: createAdvancedFilter({ device_id, remote_access_session: session_token }),
              order: {
                limit: 1,
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute()
    }),
  disconnectDeviceRemoteAccess: privateProcedure
    .input(z.object({ remote_access_session: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { remote_access_session } = input
      
      await disconnectRemoteAccess({ remote_access_session, token: ctx.token.value })
        
    }
    ),

})
