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
import { IAdvanceFilter } from '~/components/platform/Grid/Search/types';

interface InputData {
  bucket: string
  bandwidth: string
}

interface OutputData {
  bucket: string
  bandwidth: number
}

export function cleanFilter(filters: any) {
  let extracted = {
    "Time Range": null,
    "Resolution": null,
    "Graph Type": null
  };

  let newFilters = [];
  let skipNext = false;

  for (let i = 0; i < filters.length; i++) {
    let filter = filters[i];

    if (skipNext) {
      skipNext = false; // Skip the next operator
      continue;
    }

    if (filter.field === "Time Range") {
      extracted["Time Range"] = filter["Time Range"];
      skipNext = filters[i + 1]?.operator === "and"; // Mark next operator for removal
    } else if (filter.field === "Resolution") {
      extracted["Resolution"] = filter["Resolution"];
      skipNext = filters[i + 1]?.operator === "and"; // Mark next operator for removal
    } else if (filter.field === "Graph Type") {
      extracted["Graph Type"] = filter["Graph Type"];
      skipNext = filters[i + 1]?.operator === "and"; // Mark next operator for removal
    } else {
      newFilters.push(filter);
    }
  }

  return {
    extracted,
    newFilters
  };
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

  getBandwith: privateProcedure.input(z.object({ bucket_size: z.string().nullable(), time_range: z.array(z.string()), timezone: z.string(), device_id: z.string() })).query(async ({ input, ctx }) => {
    const { bucket_size, time_range, timezone, device_id } = input
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
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
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
    console.log('%c Line:236 🥒 timestamps', 'color:#ea7e5c', timestamps);

    console.log('%c Line:237 🍤', 'color:#42b983', res?.data);
    const result = timestamps.map((item) => {
      const data = res?.data.find((element: any) =>  element.bucket?.includes(item))
      if (data) {
        return { bucket: item, bandwidth: data.bandwidth }
      }
      return { bucket: item, bandwidth: 0 }
    })

    console.log('%c Line:246 🌶 result', 'color:#42b983', result);
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
      advance_filters = [],
      pluck_object: _pluck_object,
      time_range,
      device_id,
      _query
    } = input || {}
    
    
    if((Array.isArray(advance_filters) && advance_filters.length && !advance_filters[0]?.values?.[0]) || !Array.isArray(advance_filters) || !advance_filters.length){
      return {
        items: []
      }
    }

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
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'packets',
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

      console.log('%c Line:604 🍉 res?.data', 'color:#ffdd4d', {
        items: res?.data,
        _query
      });
      
    return {
      items: res?.data,
      _query
    }
  }),
  getBandwidthOfSourceIP: privateProcedure.input(z.object({ device_id: z.string(), time_range: z.array(z.string()), filter_id: z.string(), bucket_size: z.string() })).query(async ({ input, ctx }) => {
    const { device_id, time_range, filter_id, bucket_size } = input
    console.log('%c Line:634 🍫 input', 'color:#6ec1c2', input);
    
    
    let source_ips: string[] = []

    const filterPackets = async (starts_at: number) => {
      const limit = 100000

      // return []

      const { account } = ctx.session
      const { contact } = account

      const [ __filter = [], search = []] : any = await Promise.all(['filter', 'search'].map(async type => await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)))

      const findFilter = Array.isArray(__filter) ?  __filter?.find((item: any) => item?.id === filter_id): undefined
      

      
      const _filter = findFilter?.default_filter || []
      const  filtered_cached = [
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
      console.log('%c Line:639 🍷 custom_adv', 'color:#ffdd4d', filtered_cached);

      const { newFilters:custom_adv  = [] } = cleanFilter(filtered_cached)
      console.log('%c Line:672 🍷 custom_adv', 'color:#ffdd4d', custom_adv);
      
      const packets = await ctx.dnaClient
        .findAll({
          entity: 'packets',
          token: ctx.token.value,
          query: {
            track_total_records: true,
            pluck: ['source_ip', 'id', 'device_id', 'timestamp'],
            advance_filters: [
            ...custom_adv,
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
        if (_packets?.[i]) {
          sourceIPs.add((_packets[i] as any).source_ip)
        }
      }

      source_ips = [...new Set([...source_ips, ...sourceIPs])] as string[]
      

      if (_packets_length == limit) {
        const new_start = starts_at + limit
        await filterPackets(new_start)
      }
    }

    await filterPackets(0)

    

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
            {
              type: 'operator',
              operator: EOperator.AND,
            },
            {
              type: 'criteria',
              field: 'device_id',
              entity: 'packets',
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

      

      return { source_ip, result: res?.data }
    }, { concurrency: 10 })

    
    console.log('%c Line:795 🍩 ab', 'color:#2eafb0', ab);
    return ab
  }),

})
