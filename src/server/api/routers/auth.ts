import { EOperator } from '@dna-platform/common-orm';
import argon2 from 'argon2';
import crypto from 'crypto';
import { z } from 'zod';

import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { formatDate } from '~/server/utils/formatDate';
import type { TokenData } from '../types';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;
const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);

/**
 * Generates a temporary password shown once to the admin. Always ≥12 chars
 * with upper + lower + digit + special, satisfying platformPasswordValidation.ts.
 */
const generateTempPassword = () =>
  `${crypto.randomBytes(9).toString('base64')}aA1!`;

/**
 * Registers a contact account with a freshly generated temporary password and
 * `is_new_user: true` so the login gate forces `/setup-password` on first login.
 * Cookie-free (mirrors `deviceRegisterAccount`) so the acting admin stays logged
 * in. Payload mirrors `registerAccountFromInvite.ts`. Returns the temp password.
 */
async function registerContactAccount(ctx: any, record: Record<string, any>) {
  const temp_password = generateTempPassword();
  const result = await ctx.dnaClient
    .register(
      { organization_id: ctx.session.account.organization_id },
      {
        account_id: record.email.toLowerCase(),
        account_secret: temp_password, // raw; ORM hashes internally
        account_organization_id: record.id,
        is_invited: true,
        is_new_user: true,
        account_organization_status: 'Active',
        account_type: 'contact',
        responsible_account_organization_id:
          ctx.session.account.account_organization_id,
      },
    )
    .execute();

  if (!result?.success) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Account registration failed',
    });
  }

  return temp_password;
}

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
        if (error.errors?.[0]?.message.includes('Invalid Credentials')) {
          errorMessage = 'The email or password you entered is incorrect.';
          errorType = 'invalid';
        } else if (error.errors?.[0]?.message.includes('Account not found')) {
          errorMessage = 'No account was found with this email address.';
          errorType = 'notfound';
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
    .mutation(async ({ ctx }) => {
      try {
        const account = ctx.session.account;

        const accountId = account?.account_organization_id;

        const response = await ctx.dnaClient
          .findOne(accountId, {
            entity: 'account_organizations',
            token: ctx.token.value,
            query: {
              pluck: [
                'id',
                'contact_id',
                'account_organization_status',
                'status',
                'account_id'
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
            session.account.account_organization_id,
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
          entity: 'account',
          token: ctx.token.value,
          mutation: {
            params: {
              is_new_user: false,
              sync_status: 'complete',
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
        entity: 'account_organizations',
        no_caching: true,
        token: rootAccountToken,
        as_root: asRoot,
        query: {
          advance_filters: [
            {
              type: 'criteria',
              field: 'email',
              operator: EOperator.EQUAL,
              values: [response?.account_id],
            },
          ],
          pluck_object: {
            account_organizations: [
              'id',
              'organization_id',
              'account_id',
              'contact_id',
              'email',
              'status',
              'account_organization_status'
            ],
            organizations: ['id', 'name'],
            accounts: ['id', 'account_id', 'is_new_user'],
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
            entity: 'account_organizations',
            field: 'organization_id',
          },
        },
      })
      .join({
        type: 'left',
        field_relation: {
          to: {
            entity: 'accounts',
            field: 'id',
          },
          from: {
            entity: 'account_organizations',
            field: 'account_id',
          },
        },
      })
      .execute();
    const organizations = accountDetails?.data?.map((item) => {
      const { id, name } = item?.organizations ?? {};
      return {
        value: id,
        label: name,
      };
    });
    return {
      account_organization: accountDetails?.data?.[0],
      is_new_user: accountDetails?.data?.[0]?.accounts?.[0]?.is_new_user,
      organizations,
    };
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
          entity: 'account',
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
          entity: 'account_organizations',
          token: rootAccountToken,
          as_root: asRoot,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'email',
                operator: EOperator.EQUAL,
                values: [input.email.toLowerCase()],
              },
            ],
            pluck_object: {
              account_organizations: [
                'id',
                'organization_id',
                'email',
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
              entity: 'account_organizations',
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
              expiration_time: formatDate(expirationDate).time,
              account_organization_id: accountDetails?.data?.[0]?.account_organizations?.id,
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

      return {
        account_record_id: accountDetails?.data?.[0]?.account_organizations?.id,
        invitationRecord,
      };
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
   
      const response = await ctx.dnaClient
        .rootUpdateAccountPassword(input.id, input.account_secret, {
          token: rootAccountToken,
        })
        .execute();

      if (!response?.success) {
        return null;
      }

      return response;
    }),

    deviceRegisterAccount: privateProcedure
    .input(
      z.object({
        account: z.object({
          account_id: z.string().min(1),
          account_secret: z.string().min(1),
          role_id : z.string().min(1),
          account_organization_status : z.string().min(1),
          account_organization_categories : z.array(z.string()).min(1),
          device_categories : z.array(z.string()),
          account_type : z.string().min(1),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { account } = input;

      const organization = {
        organization_id : ctx.session.account.organization_id,
      }
      const result = await ctx.dnaClient
        .register(organization, {
          ...account,
          responsible_account_organization_id: ctx.session.account.account_organization_id
        })
        .execute();

      // Save account id and secret in redis

      await ctx.redisClient.cacheData(
        `account_id:${input.account.account_id}`,
        {
          account_id: input.account.account_id,
          account_secret: input.account.account_secret,
        },
        60, // 1 hour 60 * 60 - 1 minute 60
      );


      return result
    }),


    resetDeviceAppSecret: privateProcedure
    .input(
      z.object({
        account_secret: z.string().min(1),
        id: z.string().min(1),
        account_id : z.string().min(1),
        device_id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {

      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot, {
          previously_logged_in_account_id: ctx.session.account.id,
        })
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;

      const response = await ctx.dnaClient
      .rootUpdateAccountPassword(input.id, input.account_secret, {
        token: rootAccountToken,
      })
      .execute();

      if (!response?.success) {
        return null;
      }
      if(input.device_id) {
        await ctx.dnaClient
          .update(input.device_id, {
            entity: 'devices',
            token: ctx.token.value,
            mutation: {
              params: {
                id : input.device_id
              },
              pluck: ['id'],
            },
          })
          .execute();
      }

      // update redis app secret
      await ctx.redisClient.cacheData(
        `account_id:${input.account_id}`,
        {
          account_id: input.account_id,
          account_secret: input.account_secret,
        },
        60, // 1 hour 60 * 60 - 1 minute 60
      )

      return response;
    }),

  /**
   * Wizard path: activate a contact's account_organization. Creates the
   * account with a temp password when none exists yet; idempotent otherwise.
   * Never calls auth.login (would overwrite the admin's cookies).
   */
  adminActivateContactAccount: privateProcedure
    .input(
      z
        .object({
          account_organization_id: z.string().min(1),
        })
        .passthrough(),
    )
    .mutation(async ({ input, ctx }) => {
      const accountOrg = await ctx.dnaClient
        .findOne(input.account_organization_id, {
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'email',
              'account_id',
              'categories',
              'organization_id',
            ],
          },
        })
        .execute();

      const record = accountOrg?.data?.[0];
      if (!record) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Account organization not found',
        });
      }

      // Multi-tenant IDOR guard: only act on accounts in the caller's org.
      if (record.organization_id !== ctx.session.account.organization_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to activate this account',
        });
      }

      const setActive = () =>
        ctx.dnaClient
          .update(record.id, {
            entity: 'account_organizations',
            token: ctx.token.value,
            mutation: {
              params: {
                account_organization_status: 'Active',
                status: 'Active',
              },
              pluck: ['id'],
            },
          })
          .execute();

      // Idempotent: account already exists — just ensure it is Active,
      // no password reset from the wizard.
      if (record.account_id) {
        await setActive();
        return { created: false, temp_password: null };
      }

      const temp_password = await registerContactAccount(ctx, record);
      // createInvitationRecord left it Invited/Pending Setup — flip to Active.
      await setActive();

      return { created: true, temp_password };
    }),

  /**
   * Reset Password button: create the account in the background when none
   * exists, otherwise root-reset the password and flip is_new_user back on.
   * Never calls auth.login (would overwrite the admin's cookies).
   */
  adminResetAccountPassword: privateProcedure
    .input(
      z
        .object({
          account_organization_id: z.string().min(1),
        })
        .passthrough(),
    )
    .mutation(async ({ input, ctx }) => {
      const accountOrg = await ctx.dnaClient
        .findOne(input.account_organization_id, {
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'email', 'account_id', 'organization_id'],
          },
        })
        .execute();

      const record = accountOrg?.data?.[0];
      if (!record) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Account organization not found',
        });
      }

      // Multi-tenant IDOR guard: only act on accounts in the caller's org.
      if (record.organization_id !== ctx.session.account.organization_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to reset password for this account',
        });
      }

      // No account yet — create it in the background.
      if (!record.account_id) {
        const temp_password = await registerContactAccount(ctx, record);
        await ctx.dnaClient
          .update(record.id, {
            entity: 'account_organizations',
            token: ctx.token.value,
            mutation: {
              params: {
                account_organization_status: 'Active',
                status: 'Active',
              },
              pluck: ['id'],
            },
          })
          .execute();
        return { created: true, temp_password };
      }

      const temp_password = generateTempPassword();

      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot, {
          previously_logged_in_account_id: ctx.session.account.id,
        })
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;

      try {
        const response = await ctx.dnaClient
          .rootUpdateAccountPassword(record.account_id, temp_password, {
            token: rootAccountToken,
          })
          .execute();

        if (!response?.success) {
          throw new Error('Root password update rejected');
        }

        // Flip is_new_user via the root token on the account entity.
        const flipResponse = await ctx.dnaClient
          .update(record.account_id, {
            entity: 'account',
            token: rootAccountToken,
            as_root: asRoot,
            mutation: {
              params: {
                is_new_user: true,
              },
              pluck: ['id', 'is_new_user'],
            },
          })
          .execute();

        if (!flipResponse?.success) {
          throw new Error('is_new_user flip rejected');
        }
      } catch (error) {
        // Fallback: the setNewPassword-proven path — hash with argon2 and
        // update via the acting admin's token, skipping rootUpdateAccountPassword.
        const fallbackResponse = await ctx.dnaClient
          .update(record.account_id, {
            entity: 'account',
            token: ctx.token.value,
            mutation: {
              params: {
                account_secret: await argon2.hash(temp_password),
                is_new_user: true,
              },
              pluck: ['id', 'account_secret', 'is_new_user'],
            },
          })
          .execute();

        if (!fallbackResponse?.success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Password reset failed',
          });
        }
      }

      return { created: false, temp_password };
    }),
    // ProjectRequests
    draftDevice: privateProcedure.input(z.object({})).mutation(
    async ({ ctx }) =>
      await ctx.dnaClient
        .create({
          entity: 'devices',
          token: ctx.token.value,
          mutation: {
            params: {
              status: 'Draft',
              categories: ['Device'],
              is_device_online: false,
            },
            pluck: ['id', 'code'],
          },
        })
        .execute(),
  ),
});
