import { EOperator, EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'
import moment from 'moment-timezone'
import { createDefineRoutes } from '../baseCrud'


function getAllHoursBetweenDates(startDate: string, endDate: string): string[] {
  const start = moment(startDate, "YYYY-MM-DD HH:mm:ss").startOf("hour"); // Round to hour
  const end = moment(endDate, "YYYY-MM-DD HH:mm:ss");
  const hoursArray: string[] = [];

  while (start.isSameOrBefore(end)) {
    hoursArray.push(start.format("YYYY-MM-DD HH:00:00"));
    start.add(1, "hour"); // Increment by 1 hour
  }

  return hoursArray;
}


const entity = 'device_heartbeats'
export const deviceHeartbeatsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getLastHoursStatus: privateProcedure.input(
    z.object({
      device_id: z.string(),
      time_range: z.array(z.string()),
      device_status: z.boolean().optional(),
    })
  ).query(async ({ ctx, input }) => {
    const { time_range, device_id, device_status= false } = input

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.debug('%c Line:40 🍫 timezone', 'color:#465975', timezone);

    const [start, end] = time_range || {}
    const _start =  moment(start as string).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
    const _end = moment(end as string).tz(timezone).format('YYYY-MM-DD HH:mm:ss')

    const hour_range = getAllHoursBetweenDates(_start,_end)

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
        timezone
      },
      token: ctx.token.value,

    }).execute()

    const time_status = hour_range.map((hour) => {
      const found = res.data?.find(r => r.bucket === hour)
      return { hour: found?.bucket || hour, heartbeats: found?.count ? 100 : 0 }
    })


    const updateDeviceStatus =async () => {
      const device = await ctx.dnaClient
      .findOne(device_id!, {
        entity: 'devices',
        token: ctx.token.value,
        query: {
          pluck: ['device_status'],
        },
      })
      .execute()

      const device_status = device?.data?.[0]?.device_status
      const heartbeats = time_status?.[0]?.heartbeats

      const updateStatus = async (status: string) => {
       await ctx.dnaClient.update(device_id, {
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: {
              device_status: status,
            },
          },
        })
        .execute()
      }

      if(heartbeats && (device_status === 'Offline' || !device_status)){
        updateStatus('Online')
      }else if(
        !heartbeats && (device_status === 'Online' || !device_status)
      ){
        updateStatus('Offline')
      }
    }
    
    if(device_status){
      updateDeviceStatus()
    }
   

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

  




    return device_heartbeats
  }),
})
