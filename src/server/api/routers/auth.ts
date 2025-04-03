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
import { sendEmail } from '~/lib/email-helper';
import { headers } from 'next/headers';
import { formatDate } from '~/server/utils/formatDate';
import { TRPCError } from '@trpc/server';
import { TMethod, createSchedule, dateToCron } from '~/lib/createSchedule';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;
const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        organization_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { password, username } = input;
      try {
        const response = await ctx.dnaClient
          .login(username, password)
          .execute();
        if (!response.success) {
          throw response;
        }

        const token = response?.data?.[0]?.token;
        // ctx.redisClient.cacheData(
        //   `account_token:${input.username}`,
        //   token,
        //   60 * 60 * 24,
        // );
        ctx.storeCookies.set('username', input.username);
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

  getToken: privateProcedure
    .input(
      z
        .object({
          username: z.string().min(1),
        })
        .optional(),
    )
    .mutation(async ({ ctx }) => {
      // const token = await ctx.redisClient.getCachedData(
      //   `account_token:${input.username}`,
      // );
      const token = ctx.storeCookies.get('token')?.value;
      return token;
    }),

  getAccountData: privateProcedure
    .input(
      z
        .object({
          username: z.string().min(1),
        })
        .optional(),
    )
    .mutation(async ({ ctx }) => {
      try {
        const account = ctx.session.account;
        const accountId = account?.organization_account_id;

        const response = await ctx.dnaClient
          .findOne(accountId, {
            entity: 'organization_accounts',
            token: ctx.token.value,
            query: {
              pluck: [
                'id',
                'is_new_user',
                'contact_id',
                'account_status',
                'status',
              ],
            },
          })
          .execute();
        if (!response.success) {
          return null;
        }

        return {
          ...(response?.data?.[0] ?? {}),
          organization: account.organization,
        } as Record<string, any>;
      } catch (error: any) {
        return {
          message: 'Something went wrong please try again',
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
        };
      }
    }),
  loginOrganization: privateProcedure
    .input(
      z.object({
        organization_id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const asRoot = true;
        const currentToken = ctx.token.value;
        const rootAccount = await ctx.dnaClient
          .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
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

        if (session) {
          ctx.storeCookies.set(
            session.account.organization_account_id,
            newOrganization?.data?.[0]?.token,
          );
          return {
            session,
            token: newOrganization?.data?.[0]?.token,
          };
        }
      } catch (error: any) {
        return {
          message: error?.message ?? 'Something went wrong please try again',
          statusCode: 500,
          error,
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
              account_status: 'Active',
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
  fetchAccountDetailsThruEmail: privateProcedure.query(async ({ ctx }) => {
    const asRoot = true;
    const response = ctx.session.account;
    const rootAccount = await ctx.dnaClient
      .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
      .execute();
    const rootAccountToken = rootAccount?.data?.[0]?.token;
    const accountDetails = await ctx.dnaClient
      .findAll({
        entity: 'organization_accounts',
        token: rootAccountToken,
        as_root: asRoot,
        query: {
          advance_filters: [
            {
              type: 'criteria',
              field: 'account_id',
              operator: EOperator.EQUAL,
              values: [response?.email],
            },
          ],
          pluck_object: {
            organization_accounts: [
              'id',
              'organization_id',
              'account_id',
              'contact_id',
              'status',
            ],
            organizations: ['id', 'name'],
            organization_contacts: [
              'id',
              'contact_organization_id',
              'is_primary',
            ],
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'organization_contacts',
            field: 'contact_organization_id',
          },
          from: {
            entity: 'organization_accounts',
            field: 'organization_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'organizations',
            field: 'id',
          },
          from: {
            entity: 'organization_accounts',
            field: 'organization_id',
          },
        },
      })
      .execute();

    return accountDetails;
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
    ctx.storeCookies.delete('username');
    ctx.storeCookies.delete('token');
    return { message: 'User logged out' };
  }),
  verify: privateProcedure.mutation(async () => {
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
        const asRoot = true;
        const currentToken = ctx.token.value;
        const rootAccount = await ctx.dnaClient
          .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
          .execute();
        const rootAccountToken = rootAccount?.data?.[0]?.token;
        const newOrganization = await ctx.dnaClient
          .rootSwitchAccount(currentToken, input.organization_id, {
            token: rootAccountToken,
          })
          .execute();
        ctx.storeCookies.set('token', newOrganization?.data?.[0]?.token);

        return {
          token: newOrganization?.data?.[0]?.token,
        };
      } catch (error) {
        throw error;
      }
    }),
  updateOrganizationAccount: publicProcedure
    .input(
      z.object({
        account: z.record(z.any()),
        organization: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { account, organization } = input;
      const result = await ctx.dnaClient
        .updateOrganizationAccount(organization, account)
        .execute();
      return result;
    }),
  sendForgotPasswordEmail: publicProcedure
    .input(
      z.object({
        email: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;
      const accountDetails = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: rootAccountToken,
          as_root: asRoot,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'account_id',
                operator: EOperator.EQUAL,
                values: [input.email],
              },
            ],
            pluck_object: {
              organization_accounts: [
                'id',
                'organization_id',
                'account_id',
                'contact_id',
                'status',
              ],
              contacts: ['id', 'first_name', 'last_name'],
            },
            order: {
              limit: 1,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contacts',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'contact_id',
            },
          },
        })
        .execute();
      if (!accountDetails?.success) {
        return null;
      }
      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + INVITATION_LINK_EXPIRED,
      );
      const record = await ctx.dnaClient
        .create({
          entity: 'invitations',
          token: rootAccountToken,
          as_root: asRoot,
          mutation: {
            params: {
              status: 'Active',
              expiration_date: formatDate(expirationDate).date,
              account_id: accountDetails?.data?.[0]?.organization_accounts?.id,
              categories: ['Reset Password'],
            },
            pluck: ['id', 'code', 'status'],
          },
        })
        .execute();
      if (!record) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Invitation creation failed`,
        });
      }
      console.info('[Create Invitation]', record?.data);
      const invitationRecord = record?.data?.[0] ?? {};
      const headerList = headers();
      const host = headerList.get('host'); // Get the host from request headers
      const protocol = headerList.get('x-forwarded-proto') || 'http'; // Detect if running on HTTPS
      const _host = '10.4.10.45:3000'
      const baseURL = `${protocol}://${_host}`; // Construct base URL

      const resetPasswordLink = `${baseURL}/reset-password/${invitationRecord?.id}`;
      await sendEmail({
        from: 'no-reply@dnamicro.com',
        to: input.email,
        subject: 'Forgot Password',
        html: `
        <p>Hello ${accountDetails?.data?.[0]?.contacts?.first_name} ${accountDetails?.data?.[0]?.contacts?.last_name},</p>
        <p>You have requested to reset your password.</p>
        <p>Please click the link below to reset your password.</p>
        <p><a href="${resetPasswordLink}">Reset Password</a></p>
        <p>Thank you,</p>
        <p>DNA Platform</p>
        `,
      });
      const cronTime = dateToCron(
        new Date(formatDate(expirationDate).dataTime),
      );
      console.log("🚀 ~ .mutation ~ cronTime:", cronTime)

      const _cronTime = '02 14 2 4 *'
      const scheduleConfig = {
        enabled: true,
        cron: cronTime,
        callback_url: `${baseURL}/api/account/reset-password-expire`,
        method: 'POST' as TMethod,
        parameters: {
          invitation_id: invitationRecord?.id,
        },
        wait_for_completion: true,
      };
      createSchedule(scheduleConfig);
      return accountDetails?.data;
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        account_secret: z.string().min(1),
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;
      const password = await argon2.hash(input.account_secret);
      const response = await ctx.dnaClient
        .update(input.id, {
          entity: 'organization_accounts',
          token: rootAccountToken,
          as_root: asRoot,
          mutation: {
            params: {
              is_new_user: false,
              account_secret: password,
              password,
              account_status: 'Active',
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
});
