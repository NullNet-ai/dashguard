import {
  EOperator,
  EOrderDirection,
} from '@dna-platform/common-orm'
import Bluebird from 'bluebird'
import moment from 'moment-timezone'
import { z } from 'zod'

import { getFlagDetails } from '~/app/api/device/get_flags'
// import { isPrivateIp } from '~/app/portal/device/record/[code]/_components/dashboard/Map/traffic-map-leaflet/checkSourceIPS'
import { getAllTimestampsBetweenDates, parseTimeString } from '~/app/portal/device/utils/timeRange'
import { type IAdvanceFilter } from '~/components/platform/Grid/Search/types'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'

interface InputData {
  bucket: string
  bandwidth: string
}

interface OutputData {
  bucket: string
  bandwidth: number
}

function interchangeResolution(resolution: string): string {
  if (!resolution) return resolution;

  // Match the pattern (e.g., 'm3', 'h1') and rearrange it
  const match = resolution.match(/^([a-zA-Z]+)(\d+)$/);
  if (match) {
    const [, unit, value] = match; // Extract unit (e.g., 'm') and value (e.g., '3')
    return `${value}${unit}`; // Rearrange to '3m'
  }

  return resolution; // Return as-is if it doesn't match the pattern
}


export function cleanFilter(filters: any) {
  const extracted: { 'Time Range': string | null; 'Resolution': string | null; 'Graph Type': string | null } = {
    'Time Range': null,
    'Resolution': null,
    'Graph Type': null,
  }

  const newFilters = []
  let skipNext = false

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i]

    if (skipNext) {
      skipNext = false // Skip the next operator
      continue
    }

    if (filter.field === 'Time Range') {
      extracted['Time Range'] = filter['Time Range']
      skipNext = filters[i + 1]?.operator === 'and' // Mark next operator for removal
    }
    else if (filter.field === 'Resolution') {
      extracted.Resolution = interchangeResolution(filter.Resolution)
      skipNext = filters[i + 1]?.operator === 'and' // Mark next operator for removal
    }
    else if (filter.field === 'Graph Type') {
      extracted['Graph Type'] = filter['Graph Type']
      skipNext = filters[i + 1]?.operator === 'and' // Mark next operator for removal
    }
    else {
      newFilters.push(filter)
    }
  }

  return {
    extracted,
    newFilters,
  }
}

function transformData(data: InputData[]): OutputData[] {
  const result = data.map((item) => {
    return {
      ...item,
      bandwidth: parseInt(item.bandwidth),
    }
  })

  return result
}

function mergeCriteria(filters: IAdvanceFilter[]) {
  const criteriaMap = new Map()
  const result = []

  for (const item of filters) {
    if (item.type === 'criteria') {
      const key = `${item.entity}|${item.field}|${item.operator}`

      if (criteriaMap.has(key)) {
        // Merge values while ensuring uniqueness
        const existingCriteria = criteriaMap.get(key)
        existingCriteria.values = [...new Set([...existingCriteria.values, ...(item.values || [])])]
      }
      else {
        // Store new criteria
        criteriaMap.set(key, { ...item })
        result.push(criteriaMap.get(key))
      }
    }
    else if (item.type === 'operator') {
      // Push operator only if the last added item is NOT an operator
      if (result.length > 0 && result[result.length - 1].type !== 'operator') {
        result.push(item)
      }
    }
  }

  // Remove last operator if it's left at the end
  if (result.length > 0 && result[result.length - 1].type === 'operator') {
    result.pop()
  }

  return result
}

export const packetRouter = createTRPCRouter({
  ...createDefineRoutes('connections'),
  getBandwithPerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()), timezone: z.string(),
  })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone } = input

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'connections',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_byte',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'device_id',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: [
              device_id,
            ],
          },
        ],
        joins: [],
        bucket_size,
        limit: 20,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
        timezone,
      },
      token: ctx.token.value,

    }).execute()
    const transformedData: OutputData[] = transformData(res?.data as InputData[])

    return transformedData.sort((a, b) => a.bucket.localeCompare(b.bucket))
  }),

  fetchPacketsIP: privateProcedure
    .input(z.object({})).query(async ({ input, ctx }) => {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      const formattedDate = moment(oneDayAgo).format('YYYY-MM-DD HH:mm:ss.SSSZ')

      const { account } = ctx.session
      const { contact } = account

      const { filter, search }: any = await Promise.all(['filter', 'search'].map(async type => await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)))

      const filter_id = '01JNQTACVP5MR3TBZVZGMY6QCH'
      const findFilter = filter?.find((item: any) => item?.id === filter_id)
      const _filter = findFilter?.default_filter
      const custom_adv = [
        ..._filter,
        {
          type: 'operator',
          operator: EOperator.AND,
        },
        ...search,
        {
          type: 'operator',
          operator: EOperator.AND,
        },
      ]

      const res = await ctx.dnaClient
        .findAll({
          entity: 'connections',
          token: ctx.token.value,
          query: {
            pluck: ['source_ip', 'timestamp'],
            advance_filters: [
              ...custom_adv,
              {
                type: 'criteria',
                field: 'status',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: ['Active', 'active'],
              },
              {
                type: 'operator',
                operator: EOperator.OR,
              },
              {
                type: 'criteria',
                field: 'timestamp',
                entity: 'connections',
                operator: EOperator.GREATER_THAN_OR_EQUAL,
                values: [formattedDate],
              },
            ],
            order: {
              limit: 10,
              by_field: 'code',
              by_direction: EOrderDirection.DESC,
            },
          },

        })
        .execute()
      return res?.data
    }),

  getBandwith: privateProcedure.input(z.object({ bucket_size: z.string().nullable(), time_range: z.array(z.string()), timezone: z.string(), device_id: z.string() })).query(async ({ input, ctx }) => {
    const { bucket_size, time_range, timezone, device_id } = input
    if (
      !bucket_size
    ) {
      return []
    }
    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'connections',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_byte',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria',
            field: 'timestamp',
            entity: 'connections',
            operator: EOperator.IS_BETWEEN,
            values: time_range,
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'device_id',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: [
              device_id,
            ],
          },
        ],
        joins: [],
        bucket_size,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.ASC,
        },
        timezone,
      },
      token: ctx.token.value,

    }).execute()

    const [start, end] = time_range || {}
    const _start = moment(start as string).tz(timezone)
      .format('YYYY-MM-DD HH:mm:ss')
    const _end = moment(end as string).tz(timezone)
      .format('YYYY-MM-DD HH:mm:ss')

    // const unit = bucket_size.slice(-1)
    // const unitFull = getUnit(unit)
    //
    const { unit, value = '' } = parseTimeString(bucket_size) as any || {}

    const timestamps = getAllTimestampsBetweenDates(_start, _end, unit, value)

    const result = timestamps.map((item) => {
      const data = res?.data.find((element: any) => element.bucket?.includes(item))
      if (data) {
        return { bucket: item, bandwidth: data.bandwidth }
      }
      return { bucket: item, bandwidth: 0 }
    })

    return result
  }),
  getBandwithInterfacePerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()).optional(), timezone: z.string(), interface_names: z.array(z.string()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone, interface_names } = input
    
    if (
      interface_names?.length
    ) {
      const res = await Promise.all(interface_names.map(async (interface_name: string) => {
        const res = await ctx.dnaClient.aggregate({
          query: {
            entity: 'connections',
            aggregations: [
              {
                aggregation: 'SUM',
                aggregate_on: 'total_byte',
                bucket_name: 'bandwidth',
              },
            ],
            advance_filters: [
              {
                type: 'criteria' as const,
                field: 'interface_name',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [interface_name],
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria' as const,
                field: 'device_id',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [
                  device_id,
                ],
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria',
                field: 'timestamp',
                entity: 'connections',
                operator: EOperator.IS_BETWEEN,
                values: time_range,
              },
            ],
            joins: [],
            bucket_size,
            // limit: 2,
            order: {
              order_by: 'bucket',
              order_direction: EOrderDirection.DESC,
            },
            timezone,
          },
          token: ctx.token.value,

        }).execute()
        const transformedData: OutputData[] = transformData(res?.data as InputData[])
        return { [interface_name]: transformedData.sort((a, b) => a.bucket.localeCompare(b.bucket)) }
      }))
      // data = [{"vtnet1":[]},{"vtnet0":[{"bucket":"2025-03-01 13:43:22","bandwidth":634},{"bucket":"2025-03-01 13:43:23","bandwidth":382}]}]

      // [ { bucket: "2024-04-01", bandwidth: 222, static_bandwidth: 150 },  { bucket: "2024-04-02", bandwidth: 97, static_bandwidth: 180 }]
      const [start, end] = time_range || []
      const _start = moment(start as string).tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss')
      const _end = moment(end as string).tz(timezone)
        .format('YYYY-MM-DD HH:mm:ss')

      const { unit, value = '' } = parseTimeString(bucket_size) as any || {}

      const timestamps = getAllTimestampsBetweenDates(_start, _end, unit, value)

      const transform_data = timestamps?.map((item) => {
        const interface_val = res?.reduce((acc, intrfce: any) => {
          const [key, val] = Object.entries(intrfce)?.[0] as any
          

          const same_val = val?.find((element: any) => {
            return element.bucket === item})
          return {
            ...acc,
            [key]: same_val?.bandwidth || 0,
          }
        }, {})

        return {
          bucket: item,
          ...interface_val,
        }
      })

      return transform_data
    }

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'connections',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_byte',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'device_id',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: [
              device_id,
            ],
          },
        ],
        joins: [],
        bucket_size,
        limit: 21,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
        timezone,
      },
      token: ctx.token.value,

    }).execute()

    const transformedData: OutputData[] = transformData(res?.data as InputData[])

    const transformed = transformedData.sort((a, b) => a.bucket.localeCompare(b.bucket))

    return transformed
  }),
  getLastBandwithInterfacePerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()).optional(), timezone: z.string(), interface_names: z.array(z.string()).optional(),
  })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone, interface_names } = input

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'connections',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_byte',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'interface_name',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: interface_names,
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria' as const,
            field: 'device_id',
            entity: 'connections',
            operator: EOperator.EQUAL,
            values: [
              device_id,
            ],
          },
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'timestamp',
            entity: 'connections',
            operator: EOperator.IS_BETWEEN,
            values: time_range,
          },
        ],
        joins: [],
        bucket_size,
        limit: 1,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
        timezone,
      },
      token: ctx.token.value,

    }).execute()

    return res?.data?.[0]?.bandwidth || 0
  }),
  getBandwidthOfSourceIPandDestinationIP: privateProcedure.input(z.object({ packet_data: z.any() })).query(async ({ input, ctx }) => {
    const { packet_data } = input
    return await Bluebird.map(packet_data, async (item: { source_ip: string, destination_ip: string }) => {
      const { source_ip, destination_ip } = item
      const res = await ctx.dnaClient.aggregate({
      // @ts-expect-error - entity is not defined in the type
        query: {
          entity: 'connections',
          aggregations: [
            {
              aggregation: 'SUM',
              aggregate_on: 'total_length',
              bucket_name: 'bandwidth',
            },
          ],
          advance_filters: [
            {
              type: 'criteria',
              field: 'source_ip',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [
                source_ip,
              ],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'destination_ip',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [
                destination_ip,
              ],
            },
          ],
          joins: [],
          limit: 20,
          order: {
            order_by: 'bucket',
            order_direction: EOrderDirection.DESC,
          },
        },
        token: ctx.token.value,
      }).execute()

      return { source_ip, destination_ip, result: res?.data }
    }, { concurrency: 10 })
  }),
  getBandwidthOfSourceIPandDestinationIPAction: privateProcedure.input(z.object({ packet_data: z.any() })).mutation(async ({ input, ctx }) => {
    const { packet_data } = input
    return await Bluebird.map(packet_data, async (item: { source_ip: string, destination_ip: string }) => {
      const { source_ip, destination_ip } = item
      const res = await ctx.dnaClient.aggregate({
      // @ts-expect-error - entity is not defined in the type
        query: {
          entity: 'connections',
          aggregations: [
            {
              aggregation: 'SUM',
              aggregate_on: 'total_length',
              bucket_name: 'bandwidth',
            },
          ],
          advance_filters: [
            {
              type: 'criteria',
              field: 'source_ip',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [
                source_ip,
              ],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'destination_ip',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [
                destination_ip,
              ],
            },
          ],
          joins: [],
          limit: 20,
          order: {
            order_by: 'bucket',
            order_direction: EOrderDirection.DESC,
          },
        },
        token: ctx.token.value,
      }).execute()

      return { source_ip, destination_ip, result: res?.data }
    }, { concurrency: 10 })
  }),
  filterPackets: privateProcedure.input(z.record(z.unknown())).query(async ({ input, ctx }) => {
    const {
      limit = 50,
      advance_filters = [],
      pluck_object: _pluck_object,
      time_range,
      device_id,
      _query,
    } = input || {}

    if ((Array.isArray(advance_filters) && advance_filters.length && !advance_filters[0]?.values?.[0]) || !Array.isArray(advance_filters) || !advance_filters.length) {
      return {
        items: [],
      }
    }

    const res = await ctx.dnaClient
      .findAll({
        entity: 'connections',
        token: ctx.token.value,
        query: {
          track_total_records: true,
          pluck: [
            'id', 'status', 'instance_name', 'source_ip', 'destination_ip',
          ],
          advance_filters: [

            {
              type: 'criteria',
              field: 'timestamp',
              entity: 'connections',
              operator: EOperator.IS_BETWEEN,
              values: time_range,
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [device_id],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            ...advance_filters as any,

          ],
          order: {
            limit: limit as number,
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute()

    return {
      items: res?.data,
      _query,
    }
  }),
  getBandwidthOfSourceIP: privateProcedure.input(z.object({ device_id: z.string(), time_range: z.array(z.string()), bucket_size: z.string(), source_ips: z.array(z.string()) })).mutation(async ({ input, ctx }) => {
    const { device_id, time_range, bucket_size = '1s', source_ips } = input
    // return []
    const ips = await Bluebird.map(source_ips, async (source_ip: string) => {
      const res = await ctx.dnaClient.aggregate({
        query: {
          entity: 'connections',
          aggregations: [
            {
              aggregation: 'SUM',
              aggregate_on: 'total_byte',
              bucket_name: 'bandwidth',
            },
          ],
          advance_filters: [
            {
              type: 'criteria',
              field: 'timestamp',
              entity: 'connections',
              operator: EOperator.IS_BETWEEN,
              values: time_range,
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria' as const,
              field: 'source_ip',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [
                source_ip,
              ],
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'connections',
              operator: EOperator.EQUAL,
              values: [device_id],
            },
          ],
          joins: [],
          bucket_size,
          order: {
            order_by: 'bucket',
            order_direction: EOrderDirection.DESC,
          },
          // timezone,
        },
        token: ctx.token.value,

      }).execute()

      const ip_info = await ctx.dnaClient
        .findAll({
          entity: 'ip_info',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'ip',
                operator: EOperator.EQUAL,
                values: [source_ip],
              },
            ],
            order: {
              limit: 10,
              by_field: 'ip',
              by_direction: EOrderDirection.DESC,
            },
            pluck: ['country', 'region', 'city', 'ip'],
          },
        })
        .execute()
      const flagDetails = await getFlagDetails(ip_info?.data?.[0]?.country)
      return { source_ip, result: res?.data, ...flagDetails }
    }, { concurrency: 100 })

    return { data: ips }
  }),

  getUniqueSourceIP: privateProcedure.input(z.object({ device_id: z.string(), time_range: z.array(z.string()), filter_id: z.string() })).mutation(async ({ input, ctx }) => {
    const { device_id, time_range, filter_id } = input

    let source_ips: string[] = []

    const filterConnections = async (starts_at: number) => {
      // const limit = 100000
      const limit = 1000

      const { account } = ctx.session
      const { contact } = account

      const [__filter = [], search = []]: any = await Promise.all(['filter', 'search'].map(async type => await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)))

      const findFilter = Array.isArray(__filter) ? __filter?.find((item: any) => item?.id === filter_id) : undefined

      const _filter = findFilter?.group_advance_filters || []

      const [,,...rest_group_filter] = _filter || []
      // Separate filters for "country"
      const countryFilters = rest_group_filter.filter((filter: any) => {
        if (filter.type === 'criteria' && Array.isArray(filter.filters)) {
          return filter.filters.some((subFilter: any) => subFilter.field === 'country')
        }
        return false
      })

      // Remove "country" filters from the original rest_group_filter
      const otherFilters = rest_group_filter.filter((filter: any) => {
        if (filter.type === 'criteria' && Array.isArray(filter.filters)) {
          return !filter.filters.some((subFilter: any) => subFilter.field === 'country')
        }
        return true
      })

      let default_filters: any = [
        ...(search?.length
          ? [...search || [],
              {
                type: 'operator',
                operator: EOperator.AND,
              }]
          : []),
        {
          type: 'criteria',
          field: 'timestamp',
          entity: 'connections',
          operator: EOperator.IS_BETWEEN,
          values: time_range,
        },
        {
          type: 'operator',
          operator: EOperator.AND,
        },
        {
          type: 'criteria',
          field: 'device_id',
          entity: 'connections',
          operator: EOperator.EQUAL,
          values: [device_id],
        },
        ...(source_ips?.length
          ? [{
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'source_ip',
              entity: 'connections',
              operator: EOperator.NOT_EQUAL,
              values: source_ips,
            }]
          : []),
      ]?.map((item: any) => ({
        ...item,
        entity: 'connections',
      }))

      default_filters = {
        type: 'criteria',
        filters: default_filters,
      }

      const group_advance_filters = [
        default_filters,
        ...(otherFilters?.length
          ? [{
              type: 'operator',
              operator: 'and',
            },
            ...otherFilters]
          : []),
      ]

      const connections = await ctx.dnaClient
        .findAll({
          entity: 'connections',
          token: ctx.token.value,
          query: {
            track_total_records: true,
            pluck: ['source_ip', 'timestamp'],
            ...(group_advance_filters?.length > 1 ? { group_advance_filters } : { advance_filters: group_advance_filters?.[0]?.filters }),
            order: {
              starts_at,
              limit,
              // limit: group_advance_filters?.length > 1? limit : 50,
              by_field: 'timestamp',
              by_direction: EOrderDirection.DESC,
            },
            //   multiple_sort: [
            //     {
            //         "by_field": "connections.source_ip",
            //         "by_direction": EOrderDirection.ASC
            //     }
            // ]

          },

        }).groupBy({
          query: { fields: [
            'source_ip',
          ] },
        })
        .execute()

      const _connections = connections?.data || []
      const _connections_length = _connections.length

      const sourceIPs = new Set()
      for (let i = 0; i < _connections_length; i++) {
        if (_connections?.[i]) {
          sourceIPs.add((_connections[i]?.connections as any).source_ip)
        }
      }
      // 209.58.181.171
      source_ips = [...new Set([...source_ips, ...sourceIPs])] as string[]
      if (countryFilters?.length) {
        console.log("%c Line:897 🍢 countryFilters", "color:#f5ce50", countryFilters);
        const _res = await Bluebird.map(source_ips, async (source_ip: string) => {
          const res = await ctx.dnaClient
            .findAll({
              entity: 'ip_info',
              token: ctx.token.value,
              query: {
                advance_filters: [
                  {
                    type: 'criteria',
                    field: 'ip',
                    operator: EOperator.EQUAL,
                    values: [source_ip],
                  },
                  {
                    type: 'operator',
                    operator: EOperator.AND,
                  },
                  ...(Array.isArray(countryFilters) && countryFilters.length > 0
                    ? countryFilters[0]?.filters || []
                    : []),
                ],
                order: {
                  limit: 10,
                  by_field: 'ip',
                  by_direction: EOrderDirection.DESC,
                },
                pluck: ['country', 'region', 'city', 'ip'],
              },
            })
            .execute()

          if (!res?.data?.length) return null
          return { result: res?.data }
        }, { concurrency: 100 })

        if (_connections_length == limit) {
          const new_start = starts_at + limit
          await filterConnections(new_start)
        }
        const ips_with_country = (_res?.filter(Boolean))?.map(item => item?.result?.[0]?.ip)
        source_ips = ips_with_country as string[]
        return _res?.filter(Boolean)
      }
      else {
        if (_connections_length == limit) {
          const new_start = starts_at + limit
          await filterConnections(new_start)
        }
      }
    }

    await filterConnections(0)

    return source_ips || []
  }),

  // Modified backend procedure
  getUniqueSourceAndDestinationIP: privateProcedure.input(z.object({
    device_id: z.string(),
    time_range: z.array(z.string()),
    filter_id: z.string(),
    batch_size: z.number().optional()
      .default(100), // Number of records to fetch per batch
    batch_offset: z.number().optional()
      .default(0), // Starting position for the batch
  })).mutation(async ({ input, ctx }) => {
    const { device_id, time_range, batch_size = 10, batch_offset = 0 } = input
    let source_and_destination_ips: Record<string, any>[] = []

    const filterConnections = async () => {
      const connections: any = await ctx.dnaClient
        .findAll({
          entity: 'connections',
          token: ctx.token.value,
          query: {
            track_total_records: true,
            pluck: ['source_ip', 'timestamp', 'destination_ip'],
            advance_filters: [
              {
                type: 'criteria',
                field: 'timestamp',
                entity: 'connections',
                operator: EOperator.IS_BETWEEN,
                values: time_range,
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria',
                field: 'device_id',
                entity: 'connections',
                operator: EOperator.EQUAL,
                values: [device_id],
              },
            ],
            order: {
              starts_at: batch_offset, // Use the batch_offset parameter
              limit: batch_size, // Use the batch_size parameter
              by_field: 'timestamp',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      const _connections = connections?.data || []
      const _connections_length = _connections.length
      const total_records = connections?.total_records || 0 // Get total record count for client pagination

      const sourceAndDestinationIPs = new Set()
      for (let i = 0; i < _connections_length; i++) {
        if (_connections?.[i]) {
          sourceAndDestinationIPs.add({
            source_ip: (_connections[i] as any).source_ip,
            destination_ip: (_connections[i] as any).destination_ip,
          })
        }
      }
      source_and_destination_ips = [...sourceAndDestinationIPs] as Record<string, any>[]

      return {
        connections: source_and_destination_ips,
        batch_info: {
          total_records,
          has_more: total_records > (batch_offset + batch_size),
          next_offset: batch_offset + batch_size,
        },
      }
    }

    const { connections, batch_info } = await filterConnections()

    // Process this batch of IPs
    const _res = await Bluebird.map(connections, async (ips: Record<string, any>) => {
      const source_country = await ctx.dnaClient
        .findAll({
          entity: 'ip_info',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'ip',
                operator: EOperator.EQUAL,
                values: [ips?.source_ip],
              },
            ],
            order: {
              limit: 10,
              by_field: 'ip',
              by_direction: EOrderDirection.DESC,
            },
            pluck: ['country', 'region', 'city', 'ip'],
          },
        })
        .execute()

      const destination_country = await ctx.dnaClient
        .findAll({
          entity: 'ip_info',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'ip',
                operator: EOperator.EQUAL,
                values: [ips?.destination_ip],
              },
            ],
            order: {
              limit: 10,
              by_field: 'ip',
              by_direction: EOrderDirection.DESC,
            },
            pluck: ['country', 'region', 'city', 'ip'],
          },
        })
        .execute()

      return {
        source_ip: ips?.source_ip,
        destination_ip: ips?.destination_ip,
        source_country: source_country?.data?.length
          ? source_country?.data?.[0]
          : {
              country: 'No IP Info',
              region: 'No IP Info',
              city: 'No IP Info',
              ip: ips?.source_ip,
            },
        destination_country: destination_country?.data?.length
          ? destination_country?.data?.[0]
          : {
              country: 'No IP Info',
              region: 'No IP Info',
              city: 'No IP Info',
              ip: ips?.destination_ip,
            },
      }
    }, { concurrency: 100 })

    // Return both the processed data and batch information
    return {
      data: _res || [],
      batch_info,
    }
  }),

  // getCountriesSourceIP: privateProcedure.input(z.object({ source_ips: z.any(), time_range: z.array(z.string()), device_id: z.string(), filter_id: z.string(), bucket_size: z.string() })).mutation(async ({ input, ctx }) => {
  //   const { source_ips, time_range, device_id, bucket_size } = input
  //
  //   const ips = await Bluebird.map(source_ips, async (source_ip: string) => {
  //     const res = await ctx.dnaClient.aggregate({
  //       query: {
  //         entity: 'packets',
  //         aggregations: [
  //           {
  //             aggregation: 'SUM',
  //             aggregate_on: 'total_length',
  //             bucket_name: 'bandwidth',
  //           },
  //         ],
  //         advance_filters: [
  //           {
  //             type: 'criteria',
  //             field: 'timestamp',
  //             entity: 'packets',
  //             operator: EOperator.IS_BETWEEN,
  //             values: time_range,
  //           },
  //           {
  //             type: 'operator',
  //             operator: EOperator.AND,
  //           },
  //           {
  //             type: 'criteria' as const,
  //             field: 'source_ip',
  //             entity: 'packets',
  //             operator: EOperator.EQUAL,
  //             values: [
  //               source_ip,
  //             ],
  //           },
  //           {
  //             type: 'operator',
  //             operator: EOperator.AND,
  //           },
  //           {
  //             type: 'criteria',
  //             field: 'device_id',
  //             entity: 'packets',
  //             operator: EOperator.EQUAL,
  //             values: [device_id],
  //           },
  //         ],
  //         joins: [],
  //         bucket_size,
  //         order: {
  //           order_by: 'bucket',
  //           order_direction: EOrderDirection.DESC,
  //         },
  //         // timezone,
  //       },
  //       token: ctx.token.value,

  //     }).execute()

  //     const ip_info = await ctx.dnaClient
  //       .findAll({
  //         entity: 'ip_info',
  //         token: ctx.token.value,
  //         query: {
  //           advance_filters: [
  //             {
  //               type: 'criteria',
  //               field: 'ip',
  //               operator: EOperator.EQUAL,
  //               values: [source_ip],
  //             },
  //           ],
  //           order: {
  //             limit: 10,
  //             by_field: 'ip',
  //             by_direction: EOrderDirection.DESC,
  //           },
  //           pluck: ['country', 'region', 'city', 'ip'],
  //         },
  //       })
  //       .execute()
  //
  //     const flagDetails = await getFlagDetails(ip_info?.data?.[0]?.country)
  //     return { source_ip, result: res?.data, ...ip_info?.data?.[0], ...flagDetails }
  //   }, { concurrency: 100 })

  //
  //   return { data: ips }
  // }),

  getCountriesSourceIP: privateProcedure.input(z.object({ source_ips: z.any(), time_range: z.array(z.string()) })).mutation(async ({ input, ctx }) => {
    const { source_ips, time_range } = input
    const _res = await Bluebird.map(source_ips, async (source_ip: string) => {
      const res = await ctx.dnaClient
        .findAll({
          entity: 'ip_info',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'ip',
                operator: EOperator.EQUAL,
                values: [source_ip],
              },
              {
                type: 'operator',
                operator: EOperator.AND,
              },
              {
                type: 'criteria',
                field: 'timestamp',
                operator: EOperator.IS_BETWEEN,
                values: time_range,
              },
            ],
            order: {
              limit: 10,
              by_field: 'ip',
              by_direction: EOrderDirection.DESC,
            },
            pluck: ['country', 'region', 'city', 'ip'],
          },
        })
        .execute()

      if (!res?.data?.length) return null
      return { result: res?.data }
    }, { concurrency: 100 })
    return _res?.filter(Boolean)
  }),
})
