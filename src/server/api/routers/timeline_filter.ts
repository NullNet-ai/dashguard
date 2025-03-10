import { ulid } from 'ulid'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

export const timelineFilterRouter = createTRPCRouter({
  createTimelineFilter: privateProcedure
    .input(z.object({
      type: z.string(),
      data: z.unknown()
    }))
    .mutation(async ({ input, ctx }) => {
      const { type, data } = input
      const { account } = ctx.session
      const { contact } = account

      let cached_data = await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)

      cached_data = !cached_data?.length ? [] : cached_data

      const id = ulid()

       await ctx.redisClient.cacheData(`timeline_${type}_${contact.id}`, [...cached_data, { ...(data as Record<string,any>), id }])
       return id
    }
    ),
  updateTimelineFilter: privateProcedure
    .input(z.object({
      type: z.string(),
      data: z.unknown(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { type, data =[] } = input
      
      const { account } = ctx.session
      const { contact } = account

      let cached_data = await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)
      

      cached_data = !cached_data?.length ? [] : cached_data

      return await ctx.redisClient.cacheData(`timeline_${type}_${contact.id}`, [
        ...(data as Record<string,any>[] || [])
      ])
    }
    ),
  removeTimelineFilter: privateProcedure
    .input(z.object({ type: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { type } = input
      const { account } = ctx.session
      const { contact } = account
      const cached_data = await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)

      const updated_data = cached_data?.filter((data: any) => data.id !== input.id)

      return await ctx.redisClient.cacheData(`timeline_${type}_${contact.id}`, updated_data)
    }
    ),
  fetchTimelineFilter: privateProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input, ctx }) => {
      const { type } = input
      const { account } = ctx.session
      const { contact } = account
      const cached_data = await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)

      return cached_data
    }
    ),
    duplicateTimelineFilter: privateProcedure
    .input(z.object({type: z.string(), data: z.unknown()}))
    .mutation(async ({ input, ctx }) => {
      const { type, data } = input
      const { account } = ctx.session
      const { contact } = account
      let cached_data = await ctx.redisClient.getCachedData(`timeline_${type}_${contact.id}`)

      cached_data = !cached_data?.length ? [] : cached_data
      return await ctx.redisClient.cacheData(`timeline_${type}_${contact.id}`, [...cached_data, { ...(data as Record<string,any>), id: ulid() }])
    }
    ),
})
