import { z } from 'zod'

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc'

import { EStatus } from '../types'

export const formRouter = createTRPCRouter({
  createRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        fieldIdentifier: z.string(),
        data: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              ...input.data,
              status: EStatus.ACTIVE,
            },
            pluck: ['id', input.fieldIdentifier],
          },
        })
        .execute()
        .catch((error) => {
          throw error
        })

      const result = record?.data?.[0]

      return result
        ? {
            value: result?.id,
            label: result?.[input.fieldIdentifier],
          }
        : null
    }),
})
