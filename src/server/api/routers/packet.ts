import {
  EOperator,
  EOrderDirection,
} from '@dna-platform/common-orm'
import Bluebird from 'bluebird'
import { z } from 'zod'

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
  getBandwithPerSecond: privateProcedure.input(z.object({ device_id: z.string(), bucket_size: z.string(), time_range: z.array(z.string()) })).query(async ({ input, ctx }) => {
    const { device_id, bucket_size, time_range } = input

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
          order_direction: EOrderDirection.ASC,
        },
      },
      token: ctx.token.value,

    }).execute()
    const transformedData: OutputData[] = transformData(res?.data as InputData[])

    return transformedData
  }),

  fetchPacketsIP: privateProcedure
  .input(z.object({})).query(async ({input, ctx }) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const res = await ctx.dnaClient
      .findAll({
        entity: 'packets',
        token: ctx.token.value,
        query: {
          pluck: ['source_ip', 'destination_ip', 'timestamp'],
          advance_filters: [
            {
              type: 'criteria',
              field: 'status',
              entity: 'packets',
              operator: EOperator.EQUAL,
              values: ["Active", "active"],
            },
            {
              type: "operator",
              operator: EOperator.OR
          },
            {
              type: 'criteria',
              field: 'timestamp',
              entity: 'packets',
              operator: EOperator.GREATER_THAN_OR_EQUAL,
              values: ["2025-02-15 04:26:26.386+00"],
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

  getBandwidthOfSourceIPandDestinationIP: privateProcedure.input(z.object({ packet_data: z.any() })).query(async ({ input, ctx }) => {
    const { packet_data } = input
    return await Bluebird.map(packet_data, async (item: { source_ip: string, destination_ip: string }) => {
      const { source_ip, destination_ip } = item
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

      return {source_ip, destination_ip, result:res?.data}
    },{concurrency: 10} )
  }),

})

// create an interval that adds data in the packets

// filter from 3 minutes ago include seconds,
