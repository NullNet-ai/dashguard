// import z from "zod";
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  // privateProcedure
} from '~/server/api/trpc'

import { createDefineRoutes } from '../baseCrud'
const entity = 'organization_accounts'
export const organizationAccountsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getByIdPublicly: publicProcedure
    .input(
      z.object({
        id: z.string(),
        token: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity,
          token: input.token,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute()

      return {
        ...record,
        data: record?.data?.[0],
      }
    }),

})
