import { ulid } from 'ulid'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { cleanFilter } from './packet';
import { getUnit, parseTimeString } from '~/app/portal/device/utils/timeRange';

export const cachedFilterRouter = createTRPCRouter({
  createFilter: privateProcedure
    .input(z.object({
      type: z.string(),
      data: z.unknown()
    }))
    .mutation(async ({ input, ctx }) => {
      
      const { type, data } = input
      const { account } = ctx.session
      const { contact } = account

      let cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)

      cached_data = !cached_data?.length ? [] : cached_data

      const id = ulid()

       await ctx.redisClient.cacheData(`${type}_${contact.id}`, [...cached_data, { ...(data as Record<string,any>), id }])
       return id
    }
    ),
  updateFilter: privateProcedure
  .input(z.object({
    type: z.string(),
    data: z.unknown(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { type, data: input_data } = input as any
    
    const { account } = ctx.session
    const { contact } = account
    const cachedData = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)


    if (cachedData) {
      const updatedData = cachedData.map((data: any) => {
        if (data.id === input_data?.id) {
          return {
            ...data,
            ...input_data, 
          }
        }
        return data
      })
      return await ctx.redisClient.cacheData(`${type}_${contact.id}`, updatedData)
    }
  }),
    updateSearchFilter: privateProcedure
    .input(z.object({
      type: z.string(),
      data: z.unknown(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { type, data =[] } = input
      
      
      const { account } = ctx.session
      const { contact } = account

      let cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)
      

      cached_data = !cached_data?.length ? [] : cached_data

      return await ctx.redisClient.cacheData(`${type}_${contact.id}`, [
        ...(data as Record<string,any>[] || [])
      ])
    }
    ),
  removeFilter: privateProcedure
    .input(z.object({ type: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { type } = input
      const { account } = ctx.session
      const { contact } = account
      const cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)

      const updated_data = cached_data?.filter((data: any) => data.id !== input.id)

      return await ctx.redisClient.cacheData(`${type}_${contact.id}`, updated_data)
    }
    ),
  fetchCachedFilter: privateProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input, ctx }) => {
      const { type } = input
      const { account } = ctx.session
      const { contact } = account
      const cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)

      return cached_data
    }
    ),
    duplicateFilter: privateProcedure
    .input(z.object({type: z.string(), data: z.unknown()}))
    .mutation(async ({ input, ctx }) => {
      const { type, data } = input
      const { account } = ctx.session
      const { contact } = account
      let cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)

      cached_data = !cached_data?.length ? [] : cached_data
      const id = ulid()
      const default_filter = (data as Record<string,any>)?.default_filter.map((filter: any) => {
        if (filter.type === 'criteria') {
          return {
            ...filter,
            values: filter.values.map((value: Record<string,any>) => value?.value),
          }
        }
      })
      await ctx.redisClient.cacheData(`${type}_${contact.id}`, [...cached_data, { ...(data as Record<string,any>), id, default_filter}])

      return {
        ...(data as Record<string,any>),
        id,
        label: (data as Record<string,any>)?.name
      }

    }
    ),
    fetchCachedFilterTimeUnitandResolution: privateProcedure
    .input(z.object({ type: z.string(), filter_id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { type, filter_id } = input
      
      const { account } = ctx.session
      const { contact } = account
      const cached_data = await ctx.redisClient.getCachedData(`${type}_${contact.id}`)
      

      const filter = cached_data?.find((data: any) => data.id === filter_id)
      if(!filter) {
        return {
          time: {
            time_count: 1,
            time_unit: 'day'
          },
          resolution: '1h'
        }
      }
      

      const {
        extracted
      } = cleanFilter(filter?.default_filter)
      

      const {'Time Range': time_unit = '1d', Resolution: resolution = '1h'} = extracted

      const time_string = parseTimeString(time_unit as string)
      
      return {
        time : {
          time_count: time_string?.value,
          time_unit: time_string?.unit
        },
        resolution
      }
    }
    ),
})
