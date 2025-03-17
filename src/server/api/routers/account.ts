import { EOperator, IAdvanceFilters } from '@dna-platform/common-orm';
import argon2 from 'argon2';
import { z } from 'zod';
import Bluebird from 'bluebird';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { ContactAccountDetailSchema } from '~/server/zodSchema/contact/accountDetails';

import { createDefineRoutes } from '../baseCrud';
import { EStatus } from '../types';
import ZodItems from '~/server/zodSchema/grid/items';
import { formatSorting } from '~/server/utils/formatSorting';
import { pluralize } from '~/server/utils/pluralize';
import { TRPCError } from '@trpc/server';
import { formatPhoneNumber } from '~/utils/formatter';
import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { pick } from 'lodash';
import { formatDate } from '~/server/utils/formatDate';
import { TMethod, createSchedule, dateToCron } from '~/server/utils/createSchedule';

const {
  MAILER_AUTH_USER,
  MAILER_AUTH_PASS,
  MAILER_HOST,
  MAILER_PORT,
  ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!'
} = process.env;

const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);

const ENTITY = 'organization_account';
const transporter = nodemailer.createTransport({
  auth: {
    user: MAILER_AUTH_USER,
    pass: MAILER_AUTH_PASS,
  },
  host: MAILER_HOST,
  port: Number(MAILER_PORT),
});

export const accountRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateAccountDetails: privateProcedure
    .input(ContactAccountDetailSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        organization_id,
        role_id,
        account_id,
        account_secret,
        contact_id,
      } = input ?? {};

      let { id } = input;
      if (input.id) {
        const account = await ctx.dnaClient
          .update(input.id, {
            entity: 'organization_accounts',
            token: ctx.token.value,
            mutation: {
              params: {
                account_organization_id: organization_id,
                role_id,
                account_id,
                contact_id,
                ...(account_secret === '************'
                  ? {}
                  : { account_secret: await argon2.hash(account_secret) }),
              },
              pluck: [
                'id',
                'account_organization_id',
                'role_id',
                'account_id',
                'account_secret',
                'contact_id',
                'status',
              ],
            },
          })
          .execute();
        if (!account?.success) {
          return null;
        }
      } else {
        const [organizationRecord, contactRecord] = await Promise.all([
          ctx.dnaClient
            .findAll({
              entity: 'organizations',
              token: ctx.token.value,
              query: {
                ...(organization_id
                  ? {
                      advance_filters: createAdvancedFilter({
                        id: organization_id,
                      }),
                    }
                  : {
                      advance_filters: [],
                    }),
                pluck: ['id', 'name'],
              },
            })
            .execute(),
          ctx.dnaClient
            .findAll({
              entity: 'contacts',
              token: ctx.token.value,
              query: {
                advance_filters: createAdvancedFilter({
                  id: contact_id,
                }),
                pluck: ['id', 'first_name', 'last_name'],
              },
            })
            .execute(),
        ]);
        const userOrganization = ctx.session.account?.organization ?? {};

        const organization = {
          id: userOrganization?.id,
          name: userOrganization?.name || '',
        };

        const account = {
          first_name: contactRecord?.data?.[0]?.first_name || '',
          last_name: contactRecord?.data?.[0]?.last_name || '',
          email: account_id,
          password: account_secret,
          account_id,
          account_secret,
          contact_id,
          role_id,
          account_organization_id: organization_id,
          account_organization_name: organizationRecord?.data?.[0]?.name || '',
          is_new_user: true,
          categories: ['Internal User'],
          account_status: 'Pending Setup',
        };

        const result = await ctx.dnaClient
          .register(organization, account)
          .execute();

        if (!result?.success) {
          return null;
        }
        id = result.data?.[0]?.organization_account_id;
      }

      const updatedAccount = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              id: id!,
            }),
            pluck: [
              'id',
              'code',
              'account_organization_id',
              'role_id',
              'account_id',
              'account_secret',
              'contact_id',
              'status',
            ],
          },
        })
        .execute();

      const { account_organization_id, ...rest } =
        updatedAccount?.data?.[0] ?? {};
      return {
        ...rest,
        organization_id: account_organization_id,
        account_secret: '************',
      };
    }),
  fetchAccountDetails: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const contactData = await ctx.dnaClient
        .findAll({
          entity: 'contacts',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              code: input.contact_code,
            }),
            pluck_object: {
              contacts: ['id', 'code'],
              contact_emails: ['email', 'is_primary'],
            },
            pluck: ['id'],
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_emails',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .execute();

      const accounts = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              contact_id: contactData?.data?.[0]?.contacts?.id,
            }),
            pluck: [
              'id',
              'account_organization_id',
              'role_id',
              'account_id',
              'account_secret',
              'contact_id',
              'status',
            ],
          },
        })
        .execute();

      const defaultAccountId = contactData?.data?.[0]?.contact_emails?.email;
      const accountDetails = accounts.data.map(
        (account: Record<string, any>) => ({
          ...account,
          account_secret: '************',
          organization_id: account?.account_organization_id,
          disabled: true,
        }),
      );

      return {
        contact: {
          ...contactData?.data?.[0]?.contacts,
        },
        accounts: accountDetails?.length
          ? (accountDetails[0] ?? {})
          : {
              organization_id: '',
              role_id: '',
              account_id: defaultAccountId,
              account_secret: '',
              contact_id: contactData?.data?.[0]?.contacts?.id,
            },
      };
    }),
  fetchOrganizationRolesOptions: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ ctx }) => {
      const userRole = await ctx.dnaClient
        .findAll({
          entity: 'user_role',
          token: ctx.token.value,
          query: {
            pluck: ['id', 'role'],
            advance_filters: [
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: [EStatus.ACTIVE],
              },
            ],
            order: {
              limit: 100,
            },
          },
        })
        .execute();
      const user_role = userRole.data.map(({ id, role }) => ({
        value: id,
        label: role,
      }));

      return { user_role };
    }),
  updateAccountStatus: privateProcedure
    .input(z.object({ account_id: z.string(), status: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const account = ctx.dnaClient
        .update(input.account_id, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          mutation: {
            params: {
              status: input.status,
            },
            pluck: ['id', 'status'],
          },
        })
        .execute();

      return account;
    }),
  validateAccountDetails: privateProcedure
    .input(ContactAccountDetailSchema)
    .mutation(async ({ input, ctx }) => {
      const { organization_id, role_id, account_id, id, contact_id } =
        input ?? {};
      const [existingUsername, existingRoleOrg] = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity: 'organization_accounts',
            token: ctx.token.value,
            query: {
              advance_filters: [
                ...createAdvancedFilter({
                  account_id,
                }),
                ...(id
                  ? [
                      {
                        type: 'operator',
                        operator: EOperator.AND,
                      },
                      {
                        type: 'criteria',
                        field: 'id',
                        operator: EOperator.NOT_EQUAL,
                        values: [id],
                      },
                    ]
                  : []),
              ],
              pluck: ['id', 'account_id'],
            },
          })
          .execute(),
        ctx.dnaClient
          .findAll({
            entity: 'organization_accounts',
            token: ctx.token.value,
            query: {
              advance_filters: [
                ...createAdvancedFilter({
                  role_id,
                  ...(organization_id
                    ? { account_organization_id: organization_id }
                    : {}),
                }),
                {
                  type: 'operator',
                  operator: EOperator.AND,
                },
                {
                  type: 'criteria',
                  field: 'contact_id',
                  operator: EOperator.EQUAL,
                  values: [contact_id],
                },
                ...(id
                  ? [
                      {
                        type: 'operator',
                        operator: EOperator.AND,
                      },
                      {
                        type: 'criteria',
                        field: 'id',
                        operator: EOperator.NOT_EQUAL,
                        values: [id],
                      },
                    ]
                  : []),
              ],
              pluck: ['id', 'role_id', 'account_organization_id'],
            },
          })
          .execute(),
      ]);
      const isValid =
        !existingUsername.data.length && !existingRoleOrg.data.length;

      return {
        isValid,
        message: {
          account_id: existingUsername.data.length
            ? 'Email already exists'
            : '',
          role_id: existingRoleOrg.data.length
            ? 'Role already exists for this organization'
            : '',
        },
      };
    }),
  fetchWizardSummary: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'code',
                operator: EOperator.EQUAL,
                entity: 'contacts',
                values: [input.contact_code],
              },
            ],
            pluck_object: {
              organization_accounts: [
                'id',
                'account_organization_id',
                'role_id',
                'account_id',
                'contact_id',
                'status',
              ],
              contacts: ['id'],
              user_roles: ['role'],
              organizations: ['name'],
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'user_roles',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'role_id',
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
              field: 'account_organization_id',
            },
          },
        })
        .execute();

      const existingAccounts = accounts.data?.map((account) => {
        return {
          id: account.organization_accounts.id,
          organization: account.organizations.name,
          role: account.user_roles.role,
          account_id: account.organization_accounts.account_id,
        };
      });

      return existingAccounts ?? [];
    }),
  fetchGridData: privateProcedure
    .input(ZodItems)
    .query(async ({ ctx, input }) => {
      const account = ctx.session.account;
      const accountEmail = account?.email;

      const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
        .findAll({
          entity: input?.entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              organization_accounts: [
                'id',
                'account_id',
                'status',
                'code',
                'categories',
                'account_status',
                'created_date',
                'created_time',
                'updated_date',
                'updated_time',
                'created_by',
                'updated_by',
                'contact_id',
              ],
              contacts: ['id', 'first_name', 'last_name'],
              external_contacts: ['id', 'first_name', 'last_name'],
              // created_by: ['first_name', 'last_name'],
              // updated_by: ['first_name', 'last_name'],
            },
            track_total_records: true,
            advance_filters: input.advance_filters as IAdvanceFilters[],
            order: {
              starts_at:
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
            },
            multiple_sort: input.sorting?.length
              ? formatSorting(input.sorting)
              : [],
            concatenate_fields: [
              {
                fields: ['first_name', 'last_name'],
                field_name: 'full_name',
                separator: ' ',
                entity: 'contacts',
                aliased_entity: 'created_by',
              },
              {
                fields: ['first_name', 'last_name'],
                field_name: 'full_name',
                separator: ' ',
                entity: 'contacts',
                aliased_entity: 'updated_by',
              },
            ],
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              alias: 'contact',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'organization_account',
              field: 'contact_id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              alias: 'created_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'organization_account',
              field: 'created_by',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              alias: 'updated_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'organization_account',
              field: 'updated_by',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'external_contacts',
              field: 'id',
            },
            from: {
              entity: 'organization_account',
              field: 'external_contact_id',
            },
          },
        })
        .execute();

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          updated_by,
          contact,
          external_contacts,
          ...rest
        } = item;
        return {
          ...entity_data,
          ...rest,
          first_name: contact?.first_name || external_contacts?.first_name,
          last_name: contact?.last_name || external_contacts?.last_name,
          created_by: created_by
            ? `${created_by.first_name} ${created_by.last_name}`
            : null,
          updated_by: updated_by
            ? `${updated_by.first_name} ${updated_by.last_name}`
            : null,
        };
      });

      // Calculate total number of pages
      const totalPages = Math.ceil(totalCount / (input.limit || 100));
      return {
        totalCount,
        items: formatted_items,
        currentPage: input.current || 1,
        totalPages,
        accountEmail,
      };
    }),
  updateDraftAccount: privateProcedure
    .input(
      z.object({
        categories: z.string(),
        id: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const record = await ctx.dnaClient
          .update(input.id, {
            entity: ENTITY,
            token: ctx.token.value,
            mutation: {
              params: {
                categories: [input.categories],
              },
              pluck: ['id', 'code', 'categories'],
            },
          })
          .execute();
        if (!record) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `${ENTITY} update failed`,
          });
        }
        console.info('[Update Draft Account]', record);
        return {
          ...record,
          data: record?.data?.[0],
        };
      }
      const record = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              categories: [input.categories],
              status: 'Draft',
            },
            pluck: ['id', 'code', 'categories'],
          },
        })
        .execute();
      if (!record) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `${ENTITY} creation failed`,
        });
      }
      console.info('[Create Draft Account]', record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  fetchExternalInternalUserDetails: privateProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'code',
                operator: EOperator.EQUAL,
                values: [input.code],
              },
            ],
            pluck_object: {
              organization_accounts: [
                'id',
                'account_organization_id',
                'categories',
                'role_id',
                'account_id',
                'contact_id',
                'account_secret',
                'status',
                'email',
                'account_status',
                'is_new_user',
                'external_contact_id',
              ],
              contacts: ['id', 'first_name', 'last_name', 'middle_name'],
              user_roles: ['role'],
              organizations: ['name'],
              contact_phone_numbers: [
                'raw_phone_number',
                'iso_code',
                'country_code',
                'is_primary',
              ],
              contact_emails: ['email', 'is_primary'],
              external_contacts: ['id', 'first_name', 'last_name'],
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_phone_numbers',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_emails',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'user_roles',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'role_id',
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
              field: 'account_organization_id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'external_contacts',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'external_contact_id',
            },
          },
        })
        .execute();

      const accountRecord = accounts.data?.[0] ?? {};
      const phoneNumber = accountRecord?.contact_phone_numbers;
      const email = accountRecord?.contact_emails;

      return {
        ...accountRecord?.organization_accounts,
        account_email: accountRecord?.organization_accounts?.email,
        role: accountRecord?.user_roles?.role,
        phoneNumber,
        email,
        contact: {
          ...accountRecord?.contacts,
          phone: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
          email: email?.email,
        },
        external_contact: accountRecord?.external_contacts,
      };
    }),
  updateUserAccountRecord: privateProcedure
    .input(
      z.object({
        entity: z.string().min(1),
        id: z.string().min(1),
        data: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const account_secret = await argon2.hash(input.data.account_secret);

      return ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              account_id: input.data.account_id,
              role_id: input.data.role_id,
              email: input.data.account_id,
              ...(input.data.account_secret === '************'
                ? {}
                : { account_secret }),
            },
          },
        })
        .execute();
    }),
  createInvitationRecord: privateProcedure
    .input(
      z.object({
        account_code: z.string(),
        manual_trigger: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.dnaClient
        .findByCode(input.account_code, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'code',
              'account_id',
              'email',
              'categories',
              'contact_id',
            ],
          },
        })
        .execute();

      const accountRecord = account?.data?.[0];
      if (accountRecord?.contact_id) {
        const contact = await ctx.dnaClient
          .findAll({
            entity: 'contact_emails',
            token: ctx.token.value,
            query: {
              advance_filters: createAdvancedFilter({
                contact_id: accountRecord?.contact_id,
              }),
              pluck: ['id', 'email', 'is_primary'],
            },
          })
          .execute();

        accountRecord.email = contact.data?.[0]?.email;
      }

      const invitation = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              account_id: accountRecord?.id,
              status: 'Active',
            }),
            pluck: ['id', 'code', 'status'],
          },
        })
        .execute();

      let invitationRecord = invitation.data?.[0] ?? null;
      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + INVITATION_LINK_EXPIRED,
      );
      if (!invitationRecord) {
        const record = await ctx.dnaClient
          .create({
            entity: 'invitations',
            token: ctx.token.value,
            mutation: {
              params: {
                account_id: accountRecord?.id,
                status: 'Active',
                expiration_date: formatDate(expirationDate).date,
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
        console.info('[Create Draft]', record);
        invitationRecord = record?.data?.[0] ?? {};
      }

      const category = accountRecord?.categories?.[0];

      const headerList = headers();
      const host = headerList.get('host'); // Get the host from request headers
      const protocol = headerList.get('x-forwarded-proto') || 'http'; // Detect if running on HTTPS

      const baseURL = `${protocol}://${host}`; // Construct base URL

      const invitationLink = `${baseURL}/invite/${invitationRecord?.id}`;
      const loggedInUser = ctx.session.account;

      try {
        await transporter.sendMail({
          from: loggedInUser.email,
          to: accountRecord?.email,
          subject: 'Account Invitation',
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to Our Platform!</h2>
            <p>You have been invited to join our platform. Please follow the instructions below to access your account:</p>
            <ol>
              <li>Click on the invitation link below.</li>
              <li>Log in using your registered email and temporary password.</li>
              <li>Follow the prompts to set up your account.</li>
            </ol>
            <p><strong>Invitation Link:</strong> <a href="${invitationLink}" style="color: #1a73e8;">Click here to join</a></p>
            <p>If you have any issues, please contact our support team.</p>
            <p>Best regards,<br> The Team</p>
          </div>`,
        });
        console.info('Invitation email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
      const cronTime = dateToCron(new Date(formatDate(expirationDate).dataTime));
      const scheduleConfig = {
        enabled: true,
        cron: cronTime,
        callback_url: `${baseURL}/api/account/invitation-expire`,
        method: 'POST' as TMethod,
        parameters: {
          account_id: accountRecord?.id,
          invitation_id: invitationRecord?.id,
        },
        wait_for_completion: true,
      };
      createSchedule(scheduleConfig)

      await ctx.dnaClient
        .update(accountRecord?.id, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          mutation: {
            params: {
              ...(!input.manual_trigger && category === 'Internal User'
                ? { is_new_user: true }
                : {}),
              account_status: input.manual_trigger
                ? 'Invited'
                : category === 'External User'
                  ? 'Invited'
                  : 'Pending Setup',
            },
            pluck: ['id', 'status'],
          },
        })
        .execute();
      return {
        data: invitationRecord,
      };
    }),
  createInvitationRecordByAccountId: privateProcedure
    .input(
      z.object({
        account_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.dnaClient
        .findOne(input.account_id, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'code',
              'account_id',
              'email',
              'categories',
              'contact_id',
              'account_status',
            ],
          },
        })
        .execute();

      const accountRecord = account?.data?.[0];
      if (accountRecord?.contact_id) {
        const contact = await ctx.dnaClient
          .findAll({
            entity: 'contact_emails',
            token: ctx.token.value,
            query: {
              advance_filters: createAdvancedFilter({
                contact_id: accountRecord?.contact_id,
              }),
              pluck: ['id', 'email', 'is_primary'],
            },
          })
          .execute();

        accountRecord.email = contact.data?.[0]?.email;
      }
      const invitation = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              account_id: accountRecord?.id,
              status: 'Active',
            }),
            pluck: ['id', 'code', 'status'],
          },
        })
        .execute();

      let invitationRecord = invitation.data?.[0] ?? null;
      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + INVITATION_LINK_EXPIRED,
      );
      if (!invitationRecord) {
        const record = await ctx.dnaClient
          .create({
            entity: 'invitations',
            token: ctx.token.value,
            mutation: {
              params: {
                account_id: accountRecord?.id,
                status: 'Active',
                expiration_date: formatDate(expirationDate).date,
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
        console.info('[Create Draft]', record);
        invitationRecord = record?.data?.[0] ?? {};
      }

      const headerList = headers();
      const host = headerList.get('host'); // Get the host from request headers
      const protocol = headerList.get('x-forwarded-proto') || 'http'; // Detect if running on HTTPS

      const baseURL = `${protocol}://${host}`; // Construct base URL

      const invitationLink = `${baseURL}/invite/${invitationRecord?.id}`;
      const loggedInUser = ctx.session.account;

      try {
        await transporter.sendMail({
          from: loggedInUser.email,
          to: accountRecord?.email,
          subject: 'Account Invitation',
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to Our Platform!</h2>
            <p>You have been invited to join our platform. Please follow the instructions below to access your account:</p>
            <ol>
              <li>Click on the invitation link below.</li>
              <li>Log in using your registered email and temporary password.</li>
              <li>Follow the prompts to set up your account.</li>
            </ol>
            <p><strong>Invitation Link:</strong> <a href="${invitationLink}" style="color: #1a73e8;">Click here to join</a></p>
            <p>If you have any issues, please contact our support team.</p>
            <p>Best regards,<br> The Team</p>
          </div>`,
        });
        console.info('Invitation email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      await ctx.dnaClient
        .update(accountRecord?.id, {
          entity: 'organization_accounts',
          token: ctx.token.value,
          mutation: {
            params: {
              account_status: accountRecord?.account_status
                ? accountRecord?.account_status
                : 'Pending Setup',
              categories: accountRecord?.categories?.length
                ? accountRecord?.categories
                : ['Internal User'],
            },
            pluck: ['id', 'status'],
          },
        })
        .execute();

      return {
        data: invitationRecord,
      };
    }),
  getInvitationAccountDetails: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const invitation = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'id',
                operator: EOperator.EQUAL,
                values: [input.id],
              },
            ],
            pluck_object: {
              invitations: ['id', 'account_id', 'status'],
              organization_accounts: [
                'id',
                'account_organization_id',
                'role_id',
                'account_id',
                'contact_id',
                'status',
                'email',
                'categories',
              ],
              // contacts: ['id', 'first_name', 'last_name'],
              // organizations: ['name'],
              // contact_emails: ['email', 'is_primary'],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'id',
            },
            from: {
              entity: 'invitations',
              field: 'account_id',
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
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'user_roles',
              field: 'id',
            },
            from: {
              entity: 'organization_accounts',
              field: 'role_id',
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

      const invitationRecord = invitation.data?.[0] ?? {};

      const email = invitationRecord?.contact_emails;

      return {
        ...invitationRecord?.organization_accounts,
        organization: {
          categories: invitationRecord?.organizations?.categories,
          name: invitationRecord?.organizations?.name,
        },
        role: invitationRecord?.user_roles?.role,
        contact: {
          ...invitationRecord?.contacts,
          email: email?.email,
        },
      };
    }),
  checkUsernameExist: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        username: z.string(),
        contact_id: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { username, id, contact_id } = input ?? {};
      const existingUsername = await ctx.dnaClient
        .findAll({
          entity: 'organization_accounts',
          token: ctx.token.value,
          query: {
            advance_filters: [
              ...createAdvancedFilter({
                account_id: username,
              }),
              ...(id
                ? [
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria',
                      field: 'id',
                      operator: EOperator.NOT_EQUAL,
                      values: [id],
                    },
                  ]
                : []),
              ...(contact_id
                ? [
                    {
                      type: 'operator',
                      operator: EOperator.AND,
                    },
                    {
                      type: 'criteria',
                      field: 'contact_id',
                      operator: EOperator.NOT_EQUAL,
                      values: [contact_id],
                    },
                  ]
                : []),
            ],
            pluck: ['id', 'account_id', 'categories'],
          },
        })
        .execute();
      const isValid = !existingUsername.data.length;

      return {
        isValid,
        message: {
          username: existingUsername.data.length ? 'Email already exists' : '',
        },
        record: existingUsername.data?.[0],
      };
    }),
  getInvitationAccountDetailsPublicly: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const asRoot = true
      const rootAccount = await ctx.dnaClient
      .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
      .execute();
    const rootAccountToken = rootAccount?.data?.[0]?.token;
      const invitation = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: rootAccountToken,
          as_root: asRoot,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'id',
                operator: EOperator.EQUAL,
                values: [input.id],
              },
            ],
            pluck_object: {
              invitations: [
                'id',
                'account_id',
                'status',
                'updated_date',
                'expiration_date',
                'updated_time',
              ],
              organization_accounts: [
                'id',
                'account_organization_id',
                'role_id',
                'account_id',
                'organization_id',
                'status',
                'email',
                'categories',
                'account_status',
              ],
              organizations: ['id', 'name'],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'id',
            },
            from: {
              entity: 'invitations',
              field: 'account_id',
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

      const invitationRecord = invitation.data?.[0] ?? {};

      const email = invitationRecord?.contact_emails;

      return {
        ...invitationRecord?.organization_accounts,
        organization: {
          categories: invitationRecord?.organizations?.categories,
          name: invitationRecord?.organizations?.name,
        },
        organization_name: invitationRecord?.organizations?.name,
        role: invitationRecord?.user_roles?.role,
        contact: {
          ...invitationRecord?.contacts,
          email: email?.email,
        },
        invitation: invitationRecord?.invitations,
      };
    }),
  getUserGridItem: privateProcedure
    .input(ZodItems)
    .query(async ({ ctx, input }) => {
      const hasAdvanceFilters = input?.advance_filters?.length
        ? [
            // {
            //   type: "operator",
            //   operator: EOperator.AND,
            // },
            ...(input?.advance_filters ?? []),
          ]
        : [...(input?.advance_filters ?? [])];

      const { total_count: totalCount = 1, data: items } = await ctx.dnaClient
        .findAll({
          entity: 'contacts',
          token: ctx.token.value,
          query: {
            pluck_group_object: {
              contact_phone_numbers: ['raw_phone_number', 'is_primary'],
              contact_emails: ['email', 'is_primary'],
            },
            pluck_object: {
              contact_emails: ['email', 'is_primary'],
              contact_phone_numbers: [
                'raw_phone_number',
                'iso_code',
                'country_code',
                'is_primary',
              ],
              contacts: [...input.pluck, 'previous_status'],
            },
            track_total_records: true,
            advance_filters: [
              // {
              //   type: "criteria",
              //   field: "id",
              //   operator: EOperator.NOT_EQUAL,
              //   // ! TODO ENV
              //   values: ["01JCSAG79KQ1WM0F9B47Q700P1"],
              // },
              ...hasAdvanceFilters,
            ] as IAdvanceFilters[],
            order: {
              starts_at:
                // current 5 *  input.limit 50 = 250
                (input.current || 0) === 0
                  ? 0
                  : (input.current || 1) * (input.limit || 100) -
                    (input.limit || 100),
              limit: input.limit || 1,
              // by_field: "created_date",
              // by_direction: EOrderDirection.ASC,
            },
            multiple_sort: input.sorting?.length
              ? formatSorting(input.sorting)
              : [],
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_email',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'contact_phone_number',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'contact_id',
            },
            from: {
              entity: 'contacts',
              field: 'id',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'contact',
              field: 'created_by',
            },
            from: {
              alias: 'created_by',
              entity: 'contact',
              field: 'id',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'contact',
              field: 'updated_by',
            },
            from: {
              alias: 'updated_by',
              entity: 'contact',
              field: 'id',
            },
          },
        })
        .execute();

      const fetchOrganizations = async (contact_id: string) => {
        const org_contacts: any = await ctx.dnaClient
          .findAll({
            entity: 'organization_contacts',
            token: ctx.token.value,
            query: {
              pluck_object: {
                organizations: ['id', 'name'],
                organization_contacts: [
                  'id',
                  'contact_organization_id',
                  'is_primary',
                ],
              },
              advance_filters: createAdvancedFilter({
                contact_id,
              }),
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
                entity: 'organization_contacts',
                field: 'contact_organization_id',
              },
            },
          })
          .execute();

        const primary_org = org_contacts.data.find(
          (org: Record<string, any>) => !!org.organization_contacts.is_primary,
        );

        const org_contact_user_roles = await ctx.dnaClient
          .findAll({
            entity: 'organization_contact_user_roles',
            token: ctx.token.value,
            query: {
              pluck_object: {
                user_roles: ['id', 'role'],
                organization_contact_user_roles: ['id'],
              },
              advance_filters: createAdvancedFilter({
                organization_contact_id: primary_org?.organization_contacts?.id,
              }),
            },
          })
          .join({
            type: 'left',
            field_relation: {
              to: {
                entity: 'user_roles',
                field: 'id',
              },
              from: {
                entity: 'organization_contact_user_roles',
                field: 'user_role_id',
              },
            },
          })
          .execute();

        return {
          organization: primary_org?.organizations?.name ?? '',
          roles: org_contact_user_roles?.data
            ? org_contact_user_roles.data.map((item) => item?.user_roles?.role)
            : [],
        };
      };

      let formatted_items = await Bluebird.map(items, async (item: any) => {
        const { organization, roles } = await fetchOrganizations(
          item?.contacts?.id,
        );
        return {
          organization,
          roles,
          ...item,
        };
      });

      formatted_items = formatted_items.reduce(
        (acc: Record<string, string>[], item: Record<string, any>) => {
          const {
            contacts,
            contact_emails,
            contact_phone_numbers,
            created_by,
            updated_by,
            roles,
            organization,
          } = item;

          const emails = pick(contact_emails, ['emails', 'is_primaries']);
          const phones = pick(contact_phone_numbers, [
            'raw_phone_numbers',
            'iso_code',
            'country_code',
            'is_primaries',
          ]);
          const existing_contact = acc?.find(
            (acc_item: any) => acc_item?.id === contacts?.id,
          );

          if (existing_contact) return acc;

          const {
            raw_phone_numbers,
            iso_code,
            is_primaries: p_is_primaries,
          } = phones;
          const { emails: _emails, is_primaries: e_is_primaries } = emails;
          const filterPrimary = (li: string[], is_primaries: number[]) => {
            if (!li || !is_primaries) return null;
            const index = is_primaries?.findIndex(
              (is_primary) => is_primary === 1,
            );
            return index !== -1 ? li[index] : null;
          };
          const _primary_phone_number = filterPrimary(
            raw_phone_numbers,
            p_is_primaries,
          );
          const primary_email = filterPrimary(_emails, e_is_primaries);

          const primary_phone_number = formatPhoneNumber({
            raw_phone_number: _primary_phone_number as string,
            iso_code,
          });

          return [
            ...acc,
            {
              roles,
              organization,
              ...contacts,
              ...emails,
              ...phones,
              created_by: `${created_by?.first_name ?? ''} ${created_by?.last_name ?? ''}`,
              updated_by: `${updated_by?.first_name ?? ''} ${updated_by?.last_name ?? ''}`,
              raw_phone_number: primary_phone_number,
              email: primary_email,
            },
          ];
        },
        [],
      );
      const totalPages = Math.ceil(totalCount / (input.limit || 100));

      return {
        totalCount,
        items: formatted_items,
        currentPage: 0,
        totalPages,
      };
    }),
  archiveAccountInvitation: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitations = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              account_id: input?.id,
              status: 'Active',
            }),
            pluck: ['id', 'code', 'status'],
          },
        })
        .execute();

      //archive all invitations
      await Bluebird.map(invitations.data, async (invitation: any) => {
        await ctx.dnaClient
          .update(invitation.id, {
            entity: 'invitations',
            token: ctx.token.value,
            mutation: {
              params: {
                status: 'Archived',
              },
            },
          })
          .execute();
      });
    }),
});
