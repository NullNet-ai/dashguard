import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { ulid } from 'ulid'
import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'

import { createDefineRoutes } from '../baseCrud'

export const gridFilterRouter = createTRPCRouter({
  ...createDefineRoutes('grid_filters'),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        country: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const country = await ctx.dnaClient
        .findAll({
          entity: 'country',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'status'],
            advance_filters: createAdvancedFilter({ country: input.country }),
            order: {
              limit: 1,
              by_field: 'created_date',
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute()

      if (country.data.length > 0 && country?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = country?.data[0] || {}
        return {
          message: 'Country already exists',
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          existing: true,
          existing_record: {
            id: existing_id,
            status,
          },
          errors: {
            form: [
              {
                field: 'country',
                message: 'Country already exists.',
              },
            ],
          },
        }
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: 'country',
          token: ctx.token.value,
          mutation: {
            params: {
              country: input.country,
            },
          },
        })
        .execute()

      return res
    }),
  createGridFilter: privateProcedure
    .input(z.record(z.unknown()))
    .mutation(async ({ input, ctx }) => {
      const { account } = ctx.session
      const { contact } = account
      console.log('%c Line:84 🥖 account', 'color:#f5ce50', account)
      const a = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)

      const cachedData = !a?.length ? [] : a
      console.log('%c Line:83 🍇 input', 'color:#ed9ec7', input)
      return await ctx.redisClient.cacheData(`timeline_filter_${contact.id}`, [...cachedData, { ...input, id: ulid() }])
    }
    ),
  removeFilter: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { account } = ctx.session
      const { contact } = account
      const cachedData = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)

      const updatedData = cachedData?.filter((data: any) => data.id !== input.id)
      console.log('%c Line:99 🍩 updatedData', 'color:#6ec1c2', updatedData)

      return await ctx.redisClient.cacheData(`timeline_filter_${contact.id}`, updatedData)
    }
    ),
  duplicateGridFilter: privateProcedure
    .input(z.record(z.unknown()))
    .mutation(async ({ input, ctx }) => {
      console.log('%c Line:107 🌭 input', 'color:#93c0a4', input)
      const { account } = ctx.session
      const { contact } = account
      console.log('%c Line:84 🥖 account', 'color:#f5ce50', account)
      const a = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)

      const cachedData = !a?.length ? [] : a
      console.log('%c Line:83 🍇 input', 'color:#ed9ec7', input)
      return await ctx.redisClient.cacheData(`timeline_filter_${contact.id}`, [...cachedData, { ...input, id: ulid() }])
    }
    ),
  updateGridFilter: privateProcedure
    .input(z.record(z.unknown()))
    .mutation(async ({ input, ctx }) => {
      const { account } = ctx.session
      const { contact } = account
      const cachedData = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)

      if (cachedData) {
        const updatedData = cachedData.map((data: any) => {
          if (data.id === input.id) {
            // Update the data here
            return {
              ...data,
              ...input, // Assuming input contains the updated fields
            }
          }
          return data
        })

        console.log('%c Line:99 🍩 updatedData', 'color:#6ec1c2', updatedData)

        // Update the cache with the new array
        return await ctx.redisClient.cacheData(`timeline_filter_${contact.id}`, updatedData)
      }
    }),
  fetchGridFilter: privateProcedure
    .query(async ({ ctx }) => {
      const { account } = ctx.session
      const { contact } = account
      console.log('%c Line:136 🌮 contact', 'color:#e41a6a', contact)
      const a = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)
      return a
    }
    ),
})
