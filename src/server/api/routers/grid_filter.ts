import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from '@dna-platform/common-orm'
import { ulid } from 'ulid'
import { z } from 'zod'

import { createDefineRoutes } from '../baseCrud'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter'

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
  removeGridFilter: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .delete(input.id, {
          entity: 'country',
          token: ctx.token.value,
        })
        .execute()

      return res
    }
    ),
  duplicateGridFilter: privateProcedure
    .input(z.record(z.unknown()))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .create({
          entity: 'country',
          token: ctx.token.value,
          data: input,
        })
        .execute()

      return res
    }
    ),
  updateGridFilter: privateProcedure
    .input(z.record(z.unknown()))
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: 'country',
          token: ctx.token.value,
          mutation: {
            params: input,
          },
        })
        .execute()

      return res
    }
    ),
  fetchGridFilter: privateProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      const { account } = ctx.session
      const { contact } = account
      console.log('%c Line:84 🥖 accountinput', 'color:#f5ce50', account)
      const a = await ctx.redisClient.getCachedData(`timeline_filter_${contact.id}`)
      return a
    }
    ),
})
