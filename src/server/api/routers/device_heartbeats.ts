import { EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'

import { createDefineRoutes } from '../baseCrud'

const generateHourlyRange = (start: Date, _end: Date) => {
  const result = []

  while (start < _end) {
    const year = start.getUTCFullYear()
    const month = String(start.getUTCMonth() + 1).padStart(2, '0')
    const date = String(start.getUTCDate()).padStart(2, '0')
    const hours = String(start.getUTCHours()).padStart(2, '0')

    result.push(`${year}-${month}-${date} ${hours}:00:00+00`)
    start.setUTCHours(start.getUTCHours() + 1)
  }

  return result
}

const entity = 'device_heartbeats'
export const deviceHeartbeatsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getLastHoursStatus: privateProcedure.input(
    z.object({
      device_id: z.string(),
      time_range: z.array(z.string()),
    })
  ).query(async ({ ctx, input }) => {
    const { time_range } = input

    const [start, end] = time_range || {}
    const hour_range = generateHourlyRange(new Date(start as string), new Date(end as string))

    const res = await ctx.dnaClient.aggregate({
      //@ts-ignore
      query: {
        entity: 'device_heartbeats',
        aggregations: [
          {
            aggregation: 'COUNT',
            aggregate_on: 'id',
            bucket_name: 'count',
          },
        ],
        advance_filters: [
          {
            type: 'criteria',
            field: 'timestamp',
            entity: 'device_heartbeats',
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
          //   entity: 'device_heartbeats',
          //   operator: EOperator.EQUAL,
          //   values: [
          //   device_id,
          //   ],
          // },
        ],
        bucket_size: '1h',
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
      },
      token: ctx.token.value,

    }).execute()

    const time_status = hour_range.map((hour) => {
      const found = res.data?.find(r => r.bucket === hour)

      // Formatting the hour to 'mm/dd HH:mm' format
      const date = new Date(hour)
      const formattedHour = `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date
        .getUTCDate()
        .toString()
        .padStart(2, '0')} ${date.getUTCHours().toString()
        .padStart(2, '0')}:${date
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}`

      return { hour: formattedHour, heartbeats: found?.count ? 100 : 0 }
    })

    return time_status
  }),
  getLastHeartbeat: privateProcedure.input(
    z.object({
      device_id: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    const { device_id } = input

    const device_heartbeats = await ctx.dnaClient.findAll({
      entity: 'device_heartbeats',
      token: ctx.token.value,
      query: {
        pluck: ['id', 'timestamp','device_id'],
        advance_filters: createAdvancedFilter({
          status: 'Active',
          device_id,
        }) as IAdvanceFilters[],
        order: {
          by_field: 'timestamp',
          limit: 1,
          by_direction: EOrderDirection.DESC,
        },
      },
    }).execute()
    return device_heartbeats
  }),
})
