import { EDateFormats, EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { uniqBy } from 'lodash'
import { z } from 'zod'

import { createRemoteAccessSession, createRemoteAccessTunnel } from '~/app/api/device_remote_access_session/create_remote_access'
import { disconnectRemoteAccess } from '~/app/api/device_remote_access_session/disconnect_remote_access'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { formatSorting } from '~/server/utils/formatSorting'
import { formatString } from '~/server/utils/formatString'
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
  fetchDeviceTunnels: privateProcedure
    .input(
      z.object({
        device_id: z.string(),
        device_code: z.string().optional(),
        limit: z.number().optional(),
        tunnel_types: z.array(z.string()).optional(),
        status: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, device_id, device_code, tunnel_types, status = 'Active' } = input

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
          entity: 'device_tunnels',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'service_id', 'tunnel_type', 'status', 'device_id'],
            advance_filters: createAdvancedFilter({
              device_id: realDeviceId,
              ...(status ? { status } : {}),
            }),
            order: {
              limit: limit || 200,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      const tunnels = Array.isArray(res?.data) ? res.data : []
      if (!Array.isArray(tunnel_types) || tunnel_types.length === 0) return tunnels

      return tunnels.filter((t: Record<string, any>) => tunnel_types.includes(t?.tunnel_type))
    }),
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
            advance_filters: createAdvancedFilter({ device_id: realDeviceId, status: 'Active' }),
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
  getRemoteAccessSessionStatus: privateProcedure
    .input(
      z.object({
        remote_access_type: z.enum(['ssh', 'tty']),
        remote_access_session: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const baseEntity =
        input.remote_access_type === 'ssh'
          ? 'device_ssh_sessions'
          : 'device_tty_sessions'

      const res = await ctx.dnaClient
        .findAll({
          entity: baseEntity,
          token: ctx.token.value,
          query: {
            pluck: ['id', 'session_status'],
            advance_filters: createAdvancedFilter({ id: input.remote_access_session }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      return {
        success: true,
        session_status: res?.data?.[0]?.session_status ?? null,
      }
    }),
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
        is_case_sensitive_sorting = 'true',
        device_code,
      } = input
      const baseEntity = input?.entity || 'device_tunnels'
      const tunnelEntity = 'device_tunnels'
      let { advance_filters: _advance_filters = [] } = input

      console.log('$$$ [device_remote_access_session] - mainGrid - _advance_filters 1st', _advance_filters)
      
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
              {
                type: 'criteria',
                operator: 'equal',
                field: 'device_id',
                entity: baseEntity,
                values: [deviceId],
              }
          ]
        }
      }

      if (baseEntity === tunnelEntity) {
        const existingFilters = _advance_filters as IAdvanceFilters[]
        const hasTunnelTypeFilter = existingFilters.some((filter) => {
          return filter?.type === 'criteria' && filter?.field === 'tunnel_type'
        })

        if (!hasTunnelTypeFilter) {
          const nextFilters: IAdvanceFilters[] = [...existingFilters]
          const lastFilter = nextFilters[nextFilters.length - 1]

          if (nextFilters.length > 0 && lastFilter?.type !== 'operator') {
            nextFilters.push({ type: 'operator', operator: EOperator.AND } as IAdvanceFilters)
          }

          nextFilters.push({
            type: 'criteria',
            field: 'tunnel_type',
            entity: baseEntity,
            operator: EOperator.EQUAL,
            values: ['https', 'http'],
          } as IAdvanceFilters)

          _advance_filters = nextFilters
        }
      }

      const pluck_object: Record<string, any> = {
        ...addCommonGridPluckObject(),
        devices: ['device_name', 'id'],
        device_services: ['address', 'port'],
        [baseEntity]: pluck,
      }

      if (baseEntity === tunnelEntity) {
        pluck_object.device_ssh_sessions = ['id', 'session_status']
        pluck_object.device_tty_sessions = ['id', 'session_status']
      } else {
        pluck_object.device_tunnels = ['id', 'tunnel_type', 'device_id', 'service_id']
      }

      console.log('$$$ [device_remote_access_session] - mainGrid - _advance_filters', _advance_filters)

      const isCaseSensitiveSorting = is_case_sensitive_sorting === 'true'
      const singleSort = sorting?.length === 1 ? sorting[0] : undefined
      const singleSortKey = (singleSort as any)?.sort_key ?? (singleSort as any)?.id
      const resolvedOrderByField =
        sorting?.length === 1
          ? singleSort?.type === 'boolean'
            ? 'code'
            : typeof singleSortKey === 'string' && singleSortKey.includes('.')
              ? singleSortKey
              : singleSortKey || 'code'
          : 'code'

      const resolvedOrderByDirection =
        sorting?.length === 1
          ? singleSort?.desc
            ? EOrderDirection.DESC
            : EOrderDirection.ASC
          : EOrderDirection.DESC

      const query = ctx.dnaClient.findAll({
        entity: baseEntity,
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
            by_field: resolvedOrderByField,
            by_direction: resolvedOrderByDirection,
            is_case_sensitive_sorting: isCaseSensitiveSorting,
          },
          multiple_sort:
            sorting?.length && sorting?.length > 1
              ? formatSorting(
                  sorting as any,
                  baseEntity,
                  isCaseSensitiveSorting ? 'true' : '',
                )
              : [],
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
        if (baseEntity === tunnelEntity) {
          query
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'devices',
                  field: 'id',
                },
                from: {
                  entity: tunnelEntity,
                  field: 'device_id',
                },
              },
            })
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'device_services',
                  field: 'id',
                },
                from: {
                  entity: tunnelEntity,
                  field: 'service_id',
                },
              },
            })
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'device_ssh_sessions',
                  field: 'device_tunnel_id',
                },
                from: {
                  entity: tunnelEntity,
                  field: 'id',
                },
              },
            })
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'device_tty_sessions',
                  field: 'device_tunnel_id',
                },
                from: {
                  entity: tunnelEntity,
                  field: 'id',
                },
              },
            })
        }

        if (baseEntity === 'device_ssh_sessions' || baseEntity === 'device_tty_sessions') {
          query
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'devices',
                  field: 'id',
                },
                from: {
                  entity: baseEntity,
                  field: 'device_id',
                },
              },
            })
            .join({
              type: 'left',
              field_relation: {
                to: {
                  entity: tunnelEntity,
                  field: 'id',
                },
                from: {
                  entity: baseEntity,
                  field: 'device_tunnel_id',
                },
              },
            })
            .nestedJoin({
              type: 'left',
              field_relation: {
                to: {
                  entity: 'device_services',
                  field: 'id',
                },
                from: {
                  entity: tunnelEntity,
                  field: 'service_id',
                },
              },
            })
        }
      }

      addCommonGridJoins(query, baseEntity)
      const { total_count: totalCount = 1, data: items }
      = await query.execute()

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [baseEntity]: entity_data,
          created_by,
          devices,
          device_services,
          device_ssh_sessions,
          device_tty_sessions,
          device_tunnels,
          updated_by,
          ...rest
        } = item

        const resolvedTunnelType =
          baseEntity === tunnelEntity ? entity_data?.tunnel_type : device_tunnels?.tunnel_type

        const resolvedSessionStatus =
          baseEntity === 'device_ssh_sessions' || baseEntity === 'device_tty_sessions'
            ? entity_data?.session_status
            : entity_data?.status

        return {
          ...entity_data,
          ...rest,
          tunnel_type: resolvedTunnelType ?? entity_data?.tunnel_type,
          remote_access_session: baseEntity === tunnelEntity
            ? ((
                {
                  http: entity_data?.id,
                  https: entity_data?.id,
                  ssh: device_ssh_sessions?.id,
                  tty: device_tty_sessions?.id,
                } as Record<string, string | undefined>
              )[resolvedTunnelType ?? ''])
            : entity_data?.id,
          device_remote_access_type: entity_data?.remote_access_type,
          session_status: resolvedSessionStatus,
          // remote_access_category: formatString(remote_access_type),
          // type: formatString(remote_access_type),
          address: device_services?.address,
          port: device_services?.port,
          device_name: devices?.device_name,
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
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
            multiple_sort: [
              {
                by_field: 'created_date',
                by_direction: EOrderDirection.DESC,
              },
              {
                by_field: 'created_time',
                by_direction: EOrderDirection.DESC,
              },
            ],
          },
        })
        .execute();

      const instanceId = response?.data?.[0]?.id; 

      const ra_type = remote_access_type
        
      const responseDeviceTunnels = await ctx.dnaClient
        .findAll({
          entity: 'device_tunnels',
          token: ctx.token.value,
          query: {
            pluck: ['id'],
            advance_filters: createAdvancedFilter({
              ...(device_service_id ? { service_id: device_service_id } : {}),
              status: 'Active',
            }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      let tunnel_id = responseDeviceTunnels?.data?.[0]?.id
      let session_token


      if (!tunnel_id) {
        // @ts-expect-error - No type yet
        const createRemoteAccessTunnelResponse = await createRemoteAccessTunnel({ device_id, ra_type, token, instanceId , device_service_id })
        const {
          data: {
            tunnel_id: newTunnelId
          }
        } = createRemoteAccessTunnelResponse
        tunnel_id = newTunnelId
      }

      if (remote_access_type === 'ui') {
        session_token = tunnel_id
      }

      if (remote_access_type === 'ssh' || remote_access_type === 'tty') {
        // @ts-expect-error - No type yet
        const createRemoteAccessResponse = await createRemoteAccessSession({ device_id, ra_type, token, instanceId , device_service_id, tunnel_id })
        const {
          data: {
            session_id
          }
        } = createRemoteAccessResponse
        session_token = session_id
      }
      
      return {
        success: true,
        data: [
          {
            remote_access_session: session_token
          }
        ]
      }
    }),
  disconnectDeviceRemoteAccess: privateProcedure
    .input(z.object({ remote_access_session: z.string(), tunnel_type: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { remote_access_session, tunnel_type } = input
      
      if (tunnel_type === 'http' || tunnel_type === 'https') {
        const record = await ctx.dnaClient
          .update(remote_access_session, {
            entity: 'device_tunnels',
            token: ctx.token.value,
            mutation: {
              params: {
                status: 'Deleted',
              },
              pluck: ['id', 'status'],
            },
          })
          .execute()

        return {
          success: true,
          data: record?.data ?? [],
        }
      }

      const response = await disconnectRemoteAccess({
        remote_access_session,
        token: ctx.token.value,
        tunnel_type,
      })

      return {
        success: true,
        data: response ?? null,
      }
    }
    ),

})
