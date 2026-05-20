import { EOperator, EOrderDirection } from '@dna-platform/common-orm'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
} from '~/server/api/trpc'
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

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

const entity = 'device_heartbeats'
export const deviceHeartbeatsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getLastHoursStatus: privateProcedure.input(
    z.object({
      device_id: z.string(),
      time_range: z.array(z.string()),
      device_status: z.boolean().optional(),
      timezone: z.string(),
    })
  ).query(async ({ ctx, input }) => {

    const { time_range, device_id, device_status= false , timezone} = input


    const [start, end] = time_range || {}
    const _start =  moment(start as string).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
    const _end = moment(end as string).tz(timezone).format('YYYY-MM-DD HH:mm:ss')

    const hour_range = getAllHoursBetweenDates(_start,_end)

    const res = await ctx.dnaClient.aggregate({
      // @ts-expect-error - the type is not matching
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
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const rootAccount = await ctx.dnaClient
      .login('root', ROOT_ACCOUNT_PASSWORD, true)
      .execute();
    const rootAccountToken = rootAccount?.data?.[0]?.token;
      
    const deviceHeartbeats = await ctx.dnaClient.aggregate({
      // @ts-expect-error - No type yet
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
            field: 'status',
            entity: 'device_heartbeats',
            operator: EOperator.EQUAL,
            values: ['Active'],
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
            values: [device_id],
          },
        ],
        bucket_size: '1s',
        timezone,
        limit: 1,
        order: {
          order_by: 'bucket',
          order_direction: EOrderDirection.DESC,
        },
      },
      token: rootAccountToken,
      as_root: true,
    }).execute()

    return deviceHeartbeats
  }),
})
