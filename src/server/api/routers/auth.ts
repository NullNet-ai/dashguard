import { EOperator } from '@dna-platform/common-orm';
import argon2 from 'argon2';
import { z } from 'zod';

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import type { TokenData } from '../types';
import { ulid } from 'ulid';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

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
          .execute();
        if (!response.success) {
          throw response;
        }

        const token = response?.data?.[0]?.token;

        ctx.storeCookies.set('token', token);
        return response;
      } catch (error: any) {
        let errorMessage = 'Something went wrong please try again';
        let errorType = 'unknown';

        switch (error?.message) {
          case 'Invalid Credentials':
            errorMessage = 'The email or password you entered is incorrect.';
            errorType = 'invalid';
            break;
          case 'Account not found':
            errorMessage = 'No account was found with this email address.';
            errorType = ' notfound';
            break;
        }

        return {
          message: errorMessage,
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
          type: errorType,
        };
      }
    }),
  registerAccount: publicProcedure
    .input(
      z.object({
        account: z.record(z.any()),
        organization: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { account, organization } = input;
      const result = await ctx.dnaClient
        .register(organization, account)
        .execute();
      return result;
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
          .execute();

        if (!response.success) {
          return null;
        }

        return response?.data?.[0];
      } catch (error: any) {
        return {
          message: 'Something went wrong please try again',
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
        };
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
        .execute();

      if (!response?.success) {
        return null;
      }

      return response?.data?.[0];
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
        .execute();
      if (!response?.success) {
        return null;
      }
      return response?.data?.[0];
    }),
  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete('token');
    return { message: 'User logged out' };
  }),
  verify: privateProcedure.mutation(async ({ ctx }) => {
    const loggedAccountId =
      ctx.session.accounts?.[0]?.organization_account_id ?? '';
    ctx.storeCookies.set('logged_id', loggedAccountId);
    ctx.storeCookies.set(loggedAccountId, ctx.token.value);
    return true;
  }),
  switchOrganization: privateProcedure
    .input(
      z.object({
        organization_id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const currentToken = ctx.token.value;
        const rootAccount = await ctx.dnaClient
          .rootLogin('root', ROOT_ACCOUNT_PASSWORD)
          .execute();
        const rootAccountToken = rootAccount?.data?.[0]?.token;
        const newOrganization = await ctx.dnaClient
          .rootSwitchAccount(currentToken, input.organization_id, {
            token: rootAccountToken,
          })
          .execute();

        const session = await ctx.dnaClient
          .verifyToken(newOrganization?.data?.[0]?.token)
          .execute()
          .then((res) => {
            return res.data?.[0] as TokenData;
          })
          .catch(() => {
            throw new Error('Invalid Token');
          });


        const token_id = ulid();
        await ctx.redisClient.cacheData(
          `account_token:${token_id}`,
          newOrganization?.data?.[0]?.token,
          60 * 60 * 24,
        );

        if (session) {
          ctx.storeCookies.set(
            `account_token_id:${session.account.organization_account_id}`,
            token_id,
          );
          return {
            session,
            token: token_id,
          };
        }
        throw new Error('Unable to switch organization');
      } catch (error) {
        throw error;
      }
    }),
});
