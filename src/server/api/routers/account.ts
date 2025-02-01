import { EOperator } from "@dna-platform/common-orm";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { AccountDetailSchema } from "~/server/zodSchema/contact/accountDetails";
import { createDefineRoutes } from "../baseCrud";
import { EStatus } from "../types";
import argon2 from "argon2";

const entity = "organization_contacts";

export const accountRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateAccountDetails: privateProcedure
    .input(AccountDetailSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        organization_id,
        role_id,
        account_id,
        account_secret,
        contact_id,
      } = input ?? {};
      if (input.id) {
        const account = await ctx.dnaClient
          .update(input.id, {
            entity: "organization_accounts",
            token: ctx.token.value,
            mutation: {
              params: {
                account_organization_id: organization_id,
                role_id,
                account_id,
                contact_id,
                ...(account_secret === "************"
                  ? {}
                  : { account_secret: await argon2.hash(account_secret) }),
              },
              pluck: [
                "id",
                "account_organization_id",
                "role_id",
                "account_id",
                "account_secret",
                "contact_id",
                "status",
              ],
            },
          })
          .execute();
        const { account_organization_id, ...rest } = account?.data?.[0] ?? {};
        return {
          ...rest,
          organization_id: account_organization_id,
        };
      }

      const [organizationRecord, contactRecord] = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity: "organizations",
            token: ctx.token.value,
            query: {
              advance_filters: createAdvancedFilter({
                id: organization_id,
              }),
              pluck: ["id", "name"],
            },
          })
          .execute(),
        ctx.dnaClient
          .findAll({
            entity: "contacts",
            token: ctx.token.value,
            query: {
              advance_filters: createAdvancedFilter({
                id: contact_id,
              }),
              pluck: ["id", "first_name", "last_name"],
            },
          })
          .execute(),
      ]);
      const userOrganization = ctx.session.account?.organization ?? {};

      const organization = {
        id: userOrganization?.id,
        name: userOrganization?.name || "",
      };

      const account = {
        first_name: contactRecord?.data?.[0]?.first_name || "",
        last_name: contactRecord?.data?.[0]?.last_name || "",
        email: account_id,
        password: account_secret,
        account_id,
        account_secret,
        contact_id,
        role_id,
        account_organization_id: organization_id,
        account_organization_name: organizationRecord?.data?.[0]?.name || "",
      };

      const result = await ctx.dnaClient
        .register(organization, account)
        .execute();

      if (!result?.success) {
        return null;
      }

      const {
        account_organization_id,
        account_id: account_id_result,
        role_id: role_id_result,
        contact_id: contact_id_result,
        organization_account_id: id,
        status,
      } = result?.data?.[0] ?? {};
      return {
        id,
        organization_id: account_organization_id,
        account_id: account_id_result,
        role_id: role_id_result,
        account_secret: "************",
        contact_id: contact_id_result,
        status: status || 'Active',
        disabled: true,
      };
    }),
  fetchAccountDetails: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const contactData = await ctx.dnaClient
        .findAll({
          entity: "contacts",
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              code: input.contact_code,
            }),
            pluck_object: {
              contacts: ["id", "code"],
              contact_emails: ["email", "is_primary"],
            },
            pluck: ["id"],
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact_emails",
              field: "contact_id",
            },
            from: {
              entity: "contacts",
              field: "id",
            },
          },
        })
        .execute();

      const accounts = await ctx.dnaClient
        .findAll({
          entity: "organization_accounts",
          token: ctx.token.value,
          query: {
            advance_filters: createAdvancedFilter({
              contact_id: contactData?.data?.[0]?.contacts?.id,
            }),
            pluck: [
              "id",
              "account_organization_id",
              "role_id",
              "account_id",
              "account_secret",
              "contact_id",
              "status",
            ],
          },
        })
        .execute();

      const defaultAccountId = contactData?.data?.[0]?.contact_emails?.email;
      const accountDetails = accounts.data.map(
        (account: Record<string, any>) => ({
          ...account,
          account_secret: "************",
          organization_id: account?.account_organization_id,
          disabled: true,
        }),
      );

      return {
        contact: {
          ...contactData?.data?.[0]?.contacts,
        },
        accounts: accountDetails?.length
          ? accountDetails
          : [
              {
                organization_id: "",
                role_id: "",
                account_id: defaultAccountId,
                account_secret: "",
                contact_id: contactData?.data?.[0]?.contacts?.id,
                disabled: false,
              },
            ],
      };
    }),
  fetchOrganizationRolesOptions: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const contactData = await ctx.dnaClient
        .findByCode(input.contact_code, {
          entity: "contact",
          token: ctx.token.value,
          query: {
            pluck: ["id"],
          },
        })
        .execute();
      const contact_id = contactData.data?.[0]?.id;
      const [userRole, organizationData] = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity: "user_role",
            token: ctx.token.value,
            query: {
              pluck: ["id", "role"],
              advance_filters: [
                {
                  type: "criteria",
                  field: "status",
                  operator: EOperator.EQUAL,
                  values: [EStatus.ACTIVE],
                },
              ],
              order: {
                limit: 100,
              },
            },
          })
          .execute(),
        ctx.dnaClient
          .findAll({
            entity: "organization_contacts",
            token: ctx.token.value,
            query: {
              pluck_object: {
                organizations: ["id", "name"],
                organization_contacts: ["id", "contact_organization_id"],
              },
              advance_filters: createAdvancedFilter({
                contact_id,
              }),
              order: {
                limit: 100,
              },
            },
          })
          .join({
            type: "left",
            field_relation: {
              to: {
                entity: "organizations",
                field: "id",
              },
              from: {
                entity: "organization_contacts",
                field: "contact_organization_id",
              },
            },
          })
          .execute(),
      ]);
      const user_role = userRole.data.map(({ id, role }) => ({
        value: id,
        label: role,
      }));

      const organization = organizationData.data.map(
        (org: Record<string, any>) => {
          const { id, name } = org?.organizations;
          return {
            value: id,
            label: name,
          };
        },
      );

      return { organization, user_role };
    }),
  updateAccountStatus: privateProcedure
    .input(z.object({ account_id: z.string(), status: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const account = ctx.dnaClient
        .update(input.account_id, {
          entity: "organization_accounts",
          token: ctx.token.value,
          mutation: {
            params: {
              status: input.status,
            },
            pluck: ["id", "status"],
          },
        })
        .execute();

      return account;
    }),
  validateAccountDetails: privateProcedure
    .input(AccountDetailSchema)
    .mutation(async ({ input, ctx }) => {
      const { organization_id, role_id, account_id, id, contact_id } =
        input ?? {};
      const [existingUsername, existingRoleOrg] = await Promise.all([
        ctx.dnaClient
          .findAll({
            entity: "organization_accounts",
            token: ctx.token.value,
            query: {
              advance_filters: [
                ...createAdvancedFilter({
                  account_id,
                }),
                ...(id
                  ? [
                      {
                        type: "operator",
                        operator: EOperator.AND,
                      },
                      {
                        type: "criteria",
                        field: "id",
                        operator: EOperator.NOT_EQUAL,
                        values: [id],
                      },
                    ]
                  : []),
              ],
              pluck: ["id", "account_id"],
            },
          })
          .execute(),
        ctx.dnaClient
          .findAll({
            entity: "organization_accounts",
            token: ctx.token.value,
            query: {
              advance_filters: [
                ...createAdvancedFilter({
                  role_id,
                  account_organization_id: organization_id,
                }),
                {
                  type: "operator",
                  operator: EOperator.AND,
                },
                {
                  type: "criteria",
                  field: "contact_id",
                  operator: EOperator.EQUAL,
                  values: [contact_id],
                },
                ...(id
                  ? [
                      {
                        type: "operator",
                        operator: EOperator.AND,
                      },
                      {
                        type: "criteria",
                        field: "id",
                        operator: EOperator.NOT_EQUAL,
                        values: [id],
                      },
                    ]
                  : []),
              ],
              pluck: ["id", "role_id", "account_organization_id"],
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
            ? "Username already exists"
            : "",
          role_id: existingRoleOrg.data.length
            ? "Role already exists for this organization"
            : "",
        },
      };
    }),
  fetchWizardSummary: privateProcedure
    .input(z.object({ contact_code: z.string() }))
    .query(async ({ input, ctx }) => {
      const accounts = await ctx.dnaClient
        .findAll({
          entity: "organization_accounts",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "code",
                operator: EOperator.EQUAL,
                entity: "contacts",
                values: [input.contact_code],
              },
            ],
            pluck_object: {
              organization_accounts: [
                "id",
                "account_organization_id",
                "role_id",
                "account_id",
                "contact_id",
                "status",
              ],
              contacts: ["id"],
              user_roles: ["role"],
              organizations: ["name"],
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contacts",
              field: "id",
            },
            from: {
              entity: "organization_accounts",
              field: "contact_id",
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "user_roles",
              field: "id",
            },
            from: {
              entity: "organization_accounts",
              field: "role_id",
            },
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "organizations",
              field: "id",
            },
            from: {
              entity: "organization_accounts",
              field: "account_organization_id",
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
});
