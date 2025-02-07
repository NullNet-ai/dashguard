import { EOperator } from '@dna-platform/common-orm'
import argon2 from 'argon2'
import { z } from 'zod'

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc'

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ctx.dnaClient
          .login(input.username, input.password)
          .execute()
        if (!response.success) {
          throw response
        }

        const token = response?.data?.[0]?.token

        ctx.storeCookies.set('token', token)
        return { token }
      }
      catch (error: any) {
        let errorMessage = 'Something went wrong please try again'
        let errorType = 'unknown'

        switch (error?.message) {
          case 'Invalid Credentials':
            errorMessage = 'The email or password you entered is incorrect.'
            errorType = 'invalid'
            break
          case 'Account not found':
            errorMessage = 'No account was found with this email address.'
            errorType = ' notfound'
            break
        }

        return {
          message: errorMessage,
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
          type: errorType,
        }
      }
    }),
  getAccountData: privateProcedure
    .input(
      z.object({
        username: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ctx.dnaClient
          .findAll({
            entity: 'organization_accounts',
            token: ctx.token.value,
            query: {
              advance_filters: [
                {
                  type: 'criteria',
                  field: 'account_id',
                  operator: EOperator.EQUAL,
                  values: [input.username],
                },
              ],
              pluck: ['id', 'is_new_user'],
            },
          })
          .execute()

        if (!response.success) {
          return null
        }

        return response?.data?.[0]
      }
      catch (error: any) {
        return {
          message: 'Something went wrong please try again',
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
        }
      }
    }),
  setNewPassword: privateProcedure
    .input(
      z.object({
        account_secret: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const response = await ctx.dnaClient
        .update(input.id, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          mutation: {
            params: {
              is_new_user: false,
              account_secret: await argon2.hash(input.account_secret),
            },
            pluck: ['id', 'account_secret', 'is_new_user'],
          },
        })
        .execute()

      if (!response?.success) {
        return null
      }

      return response?.data?.[0]
    }),
  fetchAccountDataById: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const response = await ctx.dnaClient
        .findOne(input.id, {
          entity: 'organization_account',
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute()
      if (!response?.success) {
        return null
      }
      return response?.data?.[0]
    }),
  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete('token')
    return { message: 'User logged out' }
  }),
  verify: privateProcedure.mutation(async () => {
    return true
  }),
})
