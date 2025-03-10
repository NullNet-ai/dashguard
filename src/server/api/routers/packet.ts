import {
  EOperator,
  EOrderDirection,
} from '@dna-platform/common-orm'
import Bluebird from 'bluebird'
import moment from 'moment-timezone'
import { object, z } from 'zod'

import { getAllTimestampsBetweenDates, parseTimeString } from '~/app/portal/device/utils/timeRange'
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import ZodItems from '~/server/zodSchema/grid/items'

import { createDefineRoutes } from '../baseCrud'

interface InputData {
  bucket: string
  bandwidth: string
}

interface OutputData {
  bucket: string
  bandwidth: number
}

let filters = []

function getAllSecondsBetweenDates(startDate: Date, endDate: Date, second_count: number): string[] {
  const start_moment = new Date(startDate)
  const end_moment = new Date(endDate)
  const per_seconds = second_count * 1000

  if (isNaN(start_moment.getTime()) || isNaN(end_moment.getTime())) {
    throw new Error('Invalid date(s) provided')
  }

  const seconds_array = []

  for (let current_time = start_moment.getTime(); current_time <= end_moment.getTime(); current_time += per_seconds) {
    const current_moment = new Date(current_time)

    const formatted_date = current_moment.toISOString().replace('T', ' ')
      .split('.')[0] + '+00'

    seconds_array.push(formatted_date)
  }

  return seconds_array
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

export const packetRouter = createTRPCRouter({
  ...createDefineRoutes('packets'),
  getBandwithPerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()), timezone: z.string(),
  })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone } = input

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'packets',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_length',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'device_id',
            entity: 'packets',
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
          entity: 'packets',
          token: ctx.token.value,
          query: {
            pluck: ['source_ip', 'timestamp'],
            advance_filters: [
              ...custom_adv,
              {
                type: 'criteria',
                field: 'status',
                entity: 'packets',
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
                entity: 'packets',
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

  getBandwith: privateProcedure.input(z.object({ bucket_size: z.string().nullable(), time_range: z.array(z.string()), timezone: z.string() })).query(async ({ input, ctx }) => {
    const { bucket_size, time_range, timezone } = input
    if (
      !bucket_size
    ) {
      return []
    }
    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'packets',
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
            field: 'timestamp',
            entity: 'packets',
            operator: EOperator.IS_BETWEEN,
            values: time_range,
          },
          // {
          //   type: 'operator',
          //   operator: EOperator.AND,
          // },
          // {
          //   type: 'criteria',
          //   field: 'device_id',
          //   entity: 'packets',
          //   operator: EOperator.EQUAL,
          //   values: [
          //     device_id,
          //   ],
          // },
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
      const data = res?.data.find((element: any) => element.bucket === item)
      if (data) {
        return { bucket: item, bandwidth: data.bandwidth }
      }
      return { bucket: item, bandwidth: 0 }
    })

    return result
  }),
  getBandwithInterfacePerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()).optional(), timezone: z.string(), interface_names: z.array(z.string()).optional(),
  })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone, interface_names } = input

    if (
      interface_names?.length
    ) {
      const res = await Promise.all(interface_names.map(async (interface_name) => {
        const res = await ctx.dnaClient.aggregate({
          query: {
            entity: 'packets',
            aggregations: [
              {
                aggregation: 'SUM',
                aggregate_on: 'total_length',
                bucket_name: 'bandwidth',
              },
            ],
            advance_filters: [
              {
                type: 'criteria' as const,
                field: 'interface_name',
                entity: 'packets',
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
                entity: 'packets',
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
                entity: 'packets',
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

      // const unit = bucket_size.slice(-1)
      // const unitFull = getUnit(unit)
      //
      const { unit, value = '' } = parseTimeString(bucket_size) as any || {}

      const timestamps = getAllTimestampsBetweenDates(_start, _end, unit, value)

      const transform_data = timestamps?.map((item) => {
        const interface_val = res?.reduce((acc, intrfce: any) => {
          const [key, val] = Object.entries(intrfce)?.[0] as any
          const same_val = val?.find((element: any) => element.bucket === item)
          return {
            ...acc,
            [key]: same_val?.bandwidth || 0,
          }
        }, {})
        // []

        return {
          bucket: item,
          ...interface_val,
        }
      })

      return transform_data
    }

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'packets',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_length',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'device_id',
            entity: 'packets',
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
  getLastBandwithInterfacePerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()).optional(), timezone: z.string(), interface_names: z.array(z.string()).optional(),
  })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range, timezone, interface_names } = input

    const res = await ctx.dnaClient.aggregate({
      query: {
        entity: 'packets',
        aggregations: [
          {
            aggregation: 'SUM',
            aggregate_on: 'total_length',
            bucket_name: 'bandwidth',
          },
        ],
        advance_filters: [
          {
            type: 'criteria' as const,
            field: 'interface_name',
            entity: 'packets',
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
            entity: 'packets',
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
            entity: 'packets',
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
          entity: 'packets',
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
              entity: 'packets',
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
              entity: 'packets',
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
  // getBandwidthOfSourceIP: privateProcedure.input(z.object({ packet_data: z.any() })).query(async ({ input, ctx }) => {
  //   const { packet_data } = input
  //   return await Bluebird.map(packet_data, async (item: { source_ip: string }) => {
  //     const { source_ip } = item

  //     const res = await ctx.dnaClient.aggregate({
  //     // @ts-expect-error - entity is not defined in the type
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
  //             field: 'source_ip',
  //             entity: 'packets',
  //             operator: EOperator.EQUAL,
  //             values: [
  //               source_ip,
  //             ],
  //           },
  //         ],
  //         joins: [],
  //         limit: 20,
  //         order: {
  //           order_by: 'bucket',
  //           order_direction: EOrderDirection.DESC,
  //         },
  //       },
  //       token: ctx.token.value,
  //     }).execute()

  //     return { source_ip, result: res?.data }
  //   }, { concurrency: 10 })
  // }),
  filterPackets: privateProcedure.input(z.record(z.unknown())).query(async ({ input, ctx }) => {
    const {
      limit = 50,
      current = 1,
      advance_filters,
      pluck,
      pluck_object: _pluck_object,
      sorting = [],
      is_case_sensitive_sorting = 'false',
      time_range,
    } = input || {}
    

    const res = await ctx.dnaClient
      .findAll({
        entity: 'packets',
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
              entity: 'packets',
              operator: EOperator.IS_BETWEEN,
              values: time_range,
            },
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            ...advance_filters as any,

          ],

          // advance_filters: [
          //   {
          //     type: 'criteria',
          //     field: 'source_ip',
          //     entity: 'packets',
          //     operator: 'like',
          //     values: [
          //       '10.1.10.49',
          //     ],
          //   },
          // ],
          order: {
            limit,
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
        },
      })
      .execute()

    

    const totalPages = Math.ceil((res?.total_count || 0) / limit)
    return {
      totalCount: res?.total_count || 0,
      items: res?.data,
      currentPage: current,
      totalPages,
    }
  }),
  getBandwidthOfSourceIP: privateProcedure.input(z.object({ device_id: z.string(), time_range: z.array(z.string()), filter_id: z.string() })).query(async ({ input, ctx }) => {
    const { device_id, time_range, filter_id } = input
    console.log('%c Line:611 🍧 input', 'color:#fca650', input);
    let source_ips: string[] = []

    const filterPackets = async (starts_at: number) => {
      const limit = 1000

      

      const { account } = ctx.session
      const { contact } = account

      const [ __filter = [], search = []] : any = await Promise.all(['filter', 'search'].map(async type => await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)))

      console.log("%c Line:621234 🍉", "color:#465975", {
        filter_id,
        filter: __filter,
        search,
      });
      // const filter_id = '01JNQTACVP5MR3TBZVZGMY6QCH'
      const findFilter = Array.isArray(__filter) ?  __filter?.find((item: any) => item?.id === filter_id): undefined
      console.log("%c Line:628 🍰 findFilter", "color:#7f2b82", findFilter);

      
      const _filter = findFilter?.default_filter || []
      const custom_adv = [
      ...(_filter?.length ? [  ..._filter,
        {
          type: 'operator',
          operator: EOperator.AND,
        }]: []),
        ...(search?.length? [...search || [],
        {
          type: 'operator',
          operator: EOperator.AND,
        },] : [])
      ]?.map((item: any) => ({
        ...item,
        entity: 'packets',
      }))

      

      console.log("%c Line:655 🍤 custom_adv", "color:#ed9ec7", custom_adv);
      const packets = await ctx.dnaClient
        .findAll({
          entity: 'packets',
          token: ctx.token.value,
          query: {
            track_total_records: true,
            pluck: ['source_ip', 'id', 'device_id', 'timestamp'],
            advance_filters: [
            ...custom_adv,
              // {
              //   type: 'criteria',
              //   field: 'timestamp',
              //   entity: 'packets',
              //   operator: EOperator.IS_BETWEEN,
              //   values: time_range,
              // },
              // {
              //   type: 'operator',
              //   operator: EOperator.AND,
              // },
              {
                type: 'criteria',
                field: 'device_id',
                entity: 'packets',
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
                    entity: 'packets',
                    operator: EOperator.NOT_CONTAINS,
                    values: source_ips,
                  }]
                : []),
            ],
            order: {
              starts_at,
              limit,
              by_field: 'code',
              by_direction: EOrderDirection.DESC,
            },
          },

        })
        .execute()

      const _packets = packets?.data || []
      const _packets_length = _packets.length

      const sourceIPs = new Set()
      for (let i = 0; i < _packets_length; i++) {
        sourceIPs.add(_packets[i].source_ip)
      }

      source_ips = [...new Set([...source_ips, ...sourceIPs])] as string[]
      

      if (_packets_length == limit) {
        const new_start = starts_at + limit
        await filterPackets(new_start)
      }
    }

    await filterPackets(0)

    
const oo = [ '10.1.10.49' ]
console.log('%c Line:722 🍐 source_ips', 'color:#ffdd4d', source_ips);
    const ab = await Bluebird.map( source_ips, async (source_ip: string) => {
      

      const res = await ctx.dnaClient.aggregate({
        query: {
          entity: 'packets',
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
              field: 'timestamp',
              entity: 'packets',
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
              entity: 'packets',
              operator: EOperator.EQUAL,
              values: [
                source_ip,
              ],
            },
          ],
          joins: [],
          bucket_size: '5s',
          order: {
            order_by: 'bucket',
            order_direction: EOrderDirection.DESC,
          },
          // timezone,
        },
        token: ctx.token.value,

      }).execute()

      

      return { source_ip, result: res?.data }
    }, { concurrency: 10 })

    
    return ab
  }),

})
