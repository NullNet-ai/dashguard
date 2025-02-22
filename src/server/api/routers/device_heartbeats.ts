import { EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'

import { createDefineRoutes } from '../baseCrud'

function getAllHoursBetweenDates(startDate: Date, endDate: Date): string[] {
  // Convert the input date strings to Date objects
  const start_moment = new Date(startDate)
  const end_moment = new Date(endDate)

  // Check if both dates are valid
  if (isNaN(start_moment.getTime()) || isNaN(end_moment.getTime())) {
    throw new Error('Invalid date(s) provided')
  }

  // Reset minutes, seconds, and milliseconds for the start date
  start_moment.setMinutes(0, 0, 0)

  // Array to hold all the hours involved
  const hours_array: string[] = []

  // Loop through and generate each hour
  while (start_moment <= end_moment) {
    // Format each hour as "YYYY-MM-DD HH:00:00+00"
    const formatted_date
      = start_moment.toISOString().replace('T', ' ')
        .split('.')[0] + '+00'

    hours_array.push(formatted_date)

    // Increment the time by one hour
    start_moment.setHours(start_moment.getHours() + 1)
  }

  return hours_array
}

// Example usage:

const entity = 'device_heartbeats'
export const deviceHeartbeatsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getLastHoursStatus: privateProcedure.input(
    z.object({
      device_id: z.string(),
      time_range: z.array(z.string()),
    })
  ).query(async ({ ctx, input }) => {
    const { time_range, device_id } = input

    const [start, end] = time_range || {}
    const hour_range = getAllHoursBetweenDates(new Date(start as string), new Date(end as string))

    const res = await ctx.dnaClient.aggregate({
      // @ts-ignore
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
          {
            type: 'operator',
            operator: EOperator.AND,
          },
          {
            type: 'criteria',
            field: 'device_id',
            entity: 'device_heartbeats',
            operator: EOperator.EQUAL,
            values: [
              device_id,
            ],
          },
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
      return { hour: found?.bucket || hour, heartbeats: found?.count ? 100 : 0 }
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
        pluck: ['id', 'timestamp', 'device_id'],
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

    //this is for grid search
    if(device_heartbeats?.data?.[0]?.timestamp) {
      ctx.dnaClient.update(device_id, {
      entity: 'devices',
      token: ctx.token.value,
      mutation: {
        params: {
          last_heartbeat: device_heartbeats.data?.[0]?.timestamp,
          device_status: 'Online',
        },
      },
    })
    .execute()
    }else{
      ctx.dnaClient.update(device_id, {
        entity: 'devices',
        token: ctx.token.value,
        mutation: {
          params: {
            device_status: 'Offline',
          },
        },
      })
      .execute()
    }




    return device_heartbeats
  }),
})
