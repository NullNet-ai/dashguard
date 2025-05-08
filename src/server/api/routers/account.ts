import { EOperator, IAdvanceFilters } from '@dna-platform/common-orm';
import Bluebird from 'bluebird';
import { z } from 'zod';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';
import { ContactAccountDetailSchema } from '~/server/zodSchema/contact/accountDetails';

import { TRPCError } from '@trpc/server';
import { pick } from 'lodash';
import { formatDate } from '~/server/utils/formatDate';
import { formatSorting } from '~/server/utils/formatSorting';
import { pluralize } from '~/server/utils/pluralize';
import ZodItems from '~/server/zodSchema/grid/items';
import { formatPhoneNumber } from '~/utils/formatter';
import { createDefineRoutes } from '../baseCrud';
import { EStatus } from '../types';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);

const ENTITY = 'account_organizations';

export const accountRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateAccountDetails: privateProcedure
    .input(ContactAccountDetailSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        // organization_id,
        role_id,
        // account_id,
        // account_secret,
        email,
        contact_id,
      } = input ?? {};
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, true, {
          previously_logged_in_token: ctx.token.value,
        })
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;
      const existingAccount = await ctx.dnaClient
        .findAll({
          entity: 'accounts',
          token: rootAccountToken,
          as_root: true,
          query: {
            advance_filters: createAdvancedFilter({
              account_id: email?.toLowerCase()!,
              status: EStatus.ACTIVE,
            }),
            pluck: ['id'],
          },
        })
        .execute();

      const { id: account_id } = existingAccount?.data?.[0] ?? {};
      let contactId = contact_id;

      if (!contactId && email) {
        const contact = await ctx.dnaClient
          .findAll({
            entity: 'contact_emails',
            token: ctx.token.value,
            query: {
              advance_filters: createAdvancedFilter({
                email,
              }),
              pluck: ['id', 'contact_id'],
            },
          })
          .execute();

        contactId = contact?.data?.[0]?.contact_id ?? null;
      }
      if (input.id) {
        const updatedAccountOrg = await ctx.dnaClient
          .update(input.id, {
            entity: 'account_organizations',
            token: ctx.token.value,
            mutation: {
              params: {
                email: email?.toLowerCase(),
                role_id,
                account_id: account_id ? account_id : null,
                categories: contactId ? ['Internal User'] : ['External User'],
                contact_id: contactId,
              },
              pluck: ['id', 'email', 'role_id', 'status'],
            },
          })
          .execute();
        if (!updatedAccountOrg?.success) {
          return null;
        }
        return updatedAccountOrg.data?.[0] ?? {};
      }

      const newAccountOrg = await ctx.dnaClient
        .create({
          entity: 'account_organizations',
          token: ctx.token.value,
          mutation: {
            params: {
              email: email?.toLowerCase(),
              role_id,
              contact_id: contactId,
              status: EStatus.DRAFT,
              account_id: account_id ? account_id : null,
              categories: contactId ? ['Internal User'] : ['External User'],
            },
            pluck: ['id', 'email', 'role_id', 'status'],
          },
        })
        .execute();

      return newAccountOrg.data?.[0] ?? {};
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
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              contact_id: contactData?.data?.[0]?.contacts?.id,
            }),
            pluck: ['id', 'email', 'role_id', 'contact_id', 'status'],
          },
        })
        .execute();
      const accountData = {
        ...(accounts.data[0] ?? {}),
        email: accounts.data[0]?.email
          ? accounts.data[0]?.email
          : contactData?.data?.[0]?.contact_emails?.email,
      };

      return {
        contact: {
          ...contactData?.data?.[0]?.contacts,
        },
        account: accountData
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
          entity: 'account_organizations',
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
  fetchWizardSummary: privateProcedure
    .input(
      z.object({
        contact_code: z.string(),
        account_organization_code: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.dnaClient
        .findAll({
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            advance_filters: !input.account_organization_code
              ? [
                  {
                    type: 'criteria',
                    field: 'code',
                    operator: EOperator.EQUAL,
                    entity: 'contacts',
                    values: [input.contact_code],
                  },
                ]
              : [
                  {
                    type: 'criteria',
                    field: 'code',
                    operator: EOperator.EQUAL,
                    values: [input.account_organization_code],
                  },
                ],
            pluck_object: {
              account_organizations: [
                'id',
                'email',
                'code',
                'role_id',
                'status',
              ],
              user_roles: ['role'],
              contacts: ['id', 'code'],
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
              entity: 'account_organizations',
              field: 'role_id',
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
      const accountOrg = accounts.data[0] ?? {};

      return {
        ...accountOrg?.account_organizations,
        role: accountOrg?.user_roles?.role,
      };
    }),
  fetchGridData: privateProcedure
    .input(ZodItems)
    .query(async ({ ctx, input }) => {
      const account = ctx.session.account;
      const accountEmail = account?.account_id;

      const query = ctx.dnaClient
        .findAll({
          entity: input?.entity,
          token: ctx.token.value,
          query: {
            pluck_object: {
              account_organizations: [
                'id',
                'email',
                'status',
                'code',
                'categories',
                'account_organization_status',
                'created_date',
                'created_time',
                'updated_date',
                'updated_time',
                'created_by',
                'updated_by',
                'contact_id',
              ],
              contacts: ['id', 'first_name', 'last_name'],
              created_by_account_organizations: ['id'],
              created_by: ['id', 'first_name', 'last_name'],
              updated_by_account_organizations: ['id'],
              update_by: ['id', 'first_name', 'last_name'],
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
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'account_organizations',
              field: 'contact_id',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'account_organizations',
              field: 'id',
            },
            from: {
              alias: 'created_by_account_organizations',
              entity: 'account_organizations',
              field: 'created_by',
            },
          },
        })
        .nestedJoin({
          type: 'left',
          nested: true,
          field_relation: {
            to: {
              alias: 'created_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'account_organizations',
              field: 'created_by',
            },
          },
        })
        .join({
          type: 'self',
          field_relation: {
            to: {
              entity: 'account_organizations',
              field: 'id',
            },
            from: {
              alias: 'updated_by_account_organizations',
              entity: 'account_organizations',
              field: 'updated_by',
            },
          },
        })
        .nestedJoin({
          type: 'left',
          nested: true,
          field_relation: {
            to: {
              alias: 'updated_by',
              entity: 'contact',
              field: 'id',
            },
            from: {
              entity: 'account_organizations',
              field: 'updated_by',
            },
          },
        });
      // .join({
      //   type: 'left',
      //   field_relation: {
      //     to: {
      //       alias: 'created_by',
      //       entity: 'contact',
      //       field: 'id',
      //     },
      //     from: {
      //       entity: 'account_organizations',
      //       field: 'created_by',
      //     },
      //   },
      // })
      // .join({
      //   type: 'left',
      //   field_relation: {
      //     to: {
      //       alias: 'updated_by',
      //       entity: 'contact',
      //       field: 'id',
      //     },
      //     from: {
      //       entity: 'account_organizations',
      //       field: 'updated_by',
      //     },
      //   },
      // });

      if (input.grouping?.length) {
        query.groupBy({
          query: {
            fields: input.grouping,
            has_count: true,
          },
        });
      }
      const { total_count: totalCount = 1, data: items } =
        await query.execute();

      const totalPages = Math.ceil(totalCount / (input.limit || 100));
      if (input.grouping?.length) {
        return {
          totalCount,
          items: items,
          currentPage: 0,
          totalPages,
        };
      }

      const formatted_items = items?.map((item: Record<string, any>) => {
        const {
          [pluralize(input?.entity)]: entity_data,
          created_by,
          updated_by,
          contacts,
          external_contacts,
          ...rest
        } = item;
        return {
          ...entity_data,
          ...rest,
          first_name: contacts?.first_name || external_contacts?.first_name,
          last_name: contacts?.last_name || external_contacts?.last_name,
          created_by: created_by
            ? `${created_by.first_name} ${created_by.last_name}`
            : null,
          updated_by: updated_by
            ? `${updated_by.first_name} ${updated_by.last_name}`
            : null,
        };
      });

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
          entity: 'account_organizations',
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
              account_organizations: [
                'id',
                'role_id',
                'contact_id',
                'email',
                'categories',
                'account_organization_status',
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
              // external_contacts: ['id', 'first_name', 'last_name'],
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
              entity: 'account_organizations',
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
              entity: 'account_organizations',
              field: 'organization_id',
            },
          },
        })
        // .join({
        //   type: 'left',
        //   field_relation: {
        //     to: {
        //       entity: 'external_contacts',
        //       field: 'id',
        //     },
        //     from: {
        //       entity: 'account_organizations',
        //       field: 'external_contact_id',
        //     },
        //   },
        // })
        .execute();

      const accountRecord = accounts.data?.[0] ?? {};
      const phoneNumber = accountRecord?.contact_phone_numbers;
      const email = accountRecord?.contact_emails;

      return {
        ...accountRecord?.account_organizations,
        account_email: accountRecord?.account_organizations?.email,
        role: accountRecord?.user_roles?.role,
        phoneNumber,
        email,
        contact: {
          ...accountRecord?.contacts,
          phone: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
          email: email?.email,
        },
        account: { ...accountRecord?.account_organizations },
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
      const contactEmail = await ctx.dnaClient
        .findAll({
          entity: 'contact_emails',
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'email',
                operator: EOperator.EQUAL,
                values: [input.data.email],
              },
            ],
            pluck: ['id'],
          },
        })
        .execute();

      if (contactEmail?.data?.[0]?.id) {
      }

      return ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              email: input.data.email,
              role_id: input.data.role_id,
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
      const accountOrg = await ctx.dnaClient
        .findByCode(input.account_code, {
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            pluck: [
              'id',
              'code',
              'email',
              'contact_id',
              'account_id',
              'categories',
            ],
          },
        })
        .execute();

      const accountRecord = accountOrg?.data?.[0];

      const invitation = await ctx.dnaClient
        .findAll({
          entity: 'invitations',
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              account_organization_id: accountRecord?.id,
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
                account_organization_id: accountRecord?.id,
                status: 'Active',
                expiration_date: formatDate(expirationDate).date,
                expiration_time: formatDate(expirationDate).time,
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

      const loggedInUser = ctx.session.account;

      await ctx.dnaClient
        .update(accountRecord?.id, {
          entity: 'account_organizations',
          token: ctx.token.value,
          mutation: {
            params: {
              account_organization_status: input.manual_trigger
                ? 'Invited'
                : category === 'External User'
                  ? 'Invited'
                  : 'Pending Setup',
              status: 'Active',
            },
            pluck: ['id', 'status'],
          },
        })
        .execute();

      return {
        invitationRecord: invitationRecord,
        loggedInUser,
        account_record_id: accountRecord?.id,
        accountRecord,
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
          entity: 'account_organizations',
          token: ctx.token.value,
          query: {
            advance_filters: [
              ...createAdvancedFilter({
                email: username,
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
      const asRoot = true;
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
                'account_organization_id',
                'status',
                'updated_date',
                'expiration_date',
                'expiration_time',
                'updated_time',
                'categories',
                'created_date',
                'created_time',
              ],
              account_organizations: [
                'id',
                'contact_id',
                'role_id',
                'account_id',
                'organization_id',
                'status',
                'email',
                'categories',
                'account_organization_status',
              ],
              organizations: ['id', 'name'],
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'account_organizations',
              field: 'id',
            },
            from: {
              entity: 'invitations',
              field: 'account_organization_id',
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
        .execute();

      const invitationRecord = invitation.data?.[0] ?? {};

      const email = invitationRecord?.contact_emails;

      return {
        ...invitationRecord?.account_organizations,
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
              entity: 'account_organizations',
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
              account_organization_id: input?.id,
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
  getAccountDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asRoot = true;
      const rootAccount = await ctx.dnaClient
        .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
        .execute();
      const rootAccountToken = rootAccount?.data?.[0]?.token;
      const account = await ctx.dnaClient
        .findAll({
          entity: 'account_organizations',
          token: rootAccountToken,
          as_root: asRoot,
          query: {
            advance_filters: createAdvancedFilter({
              id: input?.id,
            }),
            pluck_object: {
              account_organizations: [
                'id',
                'code',
                'role_id',
                'account_id',
                'contact_id',
                'organization_id',
                'status',
                'email',
                'categories',
                'account_organization_status',
                'created_date',
                'created_time',
                'updated_date',
                'updated_time',
                'created_by',
                'updated_by',
              ],
              contacts: [
                'id',
                'first_name',
                'last_name',
                'middle_name',
                'code',
                'status',
                'categories',
                'created_date',
                'created_time',
                'updated_date',
                'updated_time',
                'created_by',
                'updated_by',
              ],
              organizations: ['id', 'name'],
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
        .execute();
      return {
        contact: account?.data?.[0]?.contacts,
        account_organization: {
          ...account?.data?.[0]?.account_organizations,
          contact: account?.data?.[0]?.contacts,
          organization: account?.data?.[0]?.organizations,
        },
      };
    }),
});
