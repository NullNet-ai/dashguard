import {
  EOperator,
  EOrderDirection,
} from '@dna-platform/common-orm'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
import { EStatus } from '../types'

interface InputData {
  bucket: string
  bandwidth: string
}

interface OutputData {
  second: string
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

function transformData({ start_date, end_date, second_count }: { start_date: string, end_date: string, second_count: number }, data: InputData[]): OutputData[] {
  const seconds = getAllSecondsBetweenDates(new Date(start_date), new Date(end_date), second_count)
  const result = seconds.map((second) => {
    const item = data.find(d => d.bucket === second)
    return {
      second,
      bandwidth: item ? Number(item.bandwidth) : 0,
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
        joins:[],
        bucket_size,
        limit:10,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
      },
      token: ctx.token.value,

    }).execute()
    const transformedData: OutputData[] = transformData({
      start_date: time_range[0] as string,
      end_date: time_range[1] as string,
      second_count: parseInt(bucket_size),
    }, res?.data as InputData[])

    return transformedData
  }),

  createDynamicRecord: privateProcedure
    .input(
      z.object({
        entity: z.string().min(1),
        data: z.object({}),
        device_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const formatDate = (date: any) => {
        const pad = (num: any, size = 2) => String(num).padStart(size, '0')

        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} `
          + `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.`
          + `${String(date.getUTCMilliseconds()).padStart(3, '0')}+00`
      }

      // Example output: '2025-02-04 04:51:37.134+00'

      const sampleData = {
      // code: 'PK449666',
      // tombstone: 0,
        status: 'Active',
        // version: 1,
        // created_date: '2025-02-04',
        // created_time: '04:51',
        // updated_date: '2025-02-04',
        // updated_time: '04:51',
        // organization_id: 'ee1b9a50-51ec-4ecf-bcc2-8f9511f9feb8',
        // created_by: 'a0922bd1-d994-47ab-bf63-2c855b5ea9ab',
        timestamp: new Date().toISOString(),
        device_id: input.device_id,
        // tags: [],
        hypertable_timestamp: '2025-02-04T04:51:37.134Z',
        interface_name: 'vtnet0',
        source_mac: '2c:f0:5d:88:d7:bc',
        destination_mac: '01:00:5e:00:00:fb',
        ether_type: 'unknown',
        ip_header_length: 20,
        total_length: Math.floor(Math.random() * 500),
        payload_length: Math.floor(Math.random() * 500),
        protocol: 'udp',
        source_ip: '172.18.51.11',
        destination_ip: '224.0.0.251',
        source_port: 5353,
        destination_port: 5353,
        entity_prefix: 'PK',
      }

      const a = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              ...sampleData,
              status: EStatus.ACTIVE,
            },
            pluck: ['id', 'code', 'timestamp'],
          },
        })
        .execute()

      return a
    }),

  fetchPacketsIP: privateProcedure
  .input(z.object({})).query(async ({ ctx }) => {
    const res = await ctx.dnaClient
      .findAll({
        entity: 'packets',
        token: ctx.token.value,
        query: {
          pluck: ['source_ip', 'destination_ip'],
          advance_filters: [
            {
              type: 'criteria',
              field: 'status',
              entity: 'packets',
              operator: EOperator.EQUAL,
              values: ["Active", "active"],
            },
          ],
          order: {
            limit: 100,
            by_field: 'code',
            by_direction: EOrderDirection.DESC,
          },
        },
        
      })
      .execute()

    return res?.data
  }),

})

// create an interval that adds data in the packets

// filter from 3 minutes ago include seconds,
