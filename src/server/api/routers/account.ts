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
      console.log(
        "%c 💗: input ",
        "font-size:16px;background-color:#1db69a;color:white;",
        input,
      );
      const {
        organization_id,
        user_role_id,
        account_id,
        account_secret,
        contact_id,
      } = input ?? {};
      if (input.id) {
        const account = ctx.dnaClient
          .update(input.id, {
            entity: "organization_accounts",
            token: ctx.token.value,
            mutation: {
              params: {
                organization_id,
                user_role_id,
                account_id,
                account_secret,
                contact_id,
              },
              pluck: ["id"],
            },
          })
          .execute();
        return account;
      }

      const account = ctx.dnaClient
        .create({
          entity: "organization_accounts",
          token: ctx.token.value,
          mutation: {
            params: {
              contact_id,
              organization_id,
              user_role_id,
              account_id,
              account_secret: await argon2.hash(account_secret),
              account_status: "Active",
              status: "Active",
            },
            pluck: ["id"],
          },
        })
        .execute();
      return account;
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
              "organization_id",
              "user_role_id",
              "account_id",
              "account_secret",
              "account_status",
            ],
          },
        })
        .execute();

      const defaultAccountId = contactData?.data?.[0]?.contact_emails?.email;
      const accountDetails = accounts.data.map(
        (account: Record<string, any>) => ({
          ...account,
          disabled: true,
        }),
      );
      console.log(
        "%c 👨‍🔬: accountDetails ",
        "font-size:16px;background-color:#17e2fd;color:black;",
        accountDetails,
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
                user_role_id: "",
                account_id: defaultAccountId,
                account_secret: "",
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
    .input(z.object({ account_id: z.string(), account_status: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const account = ctx.dnaClient
        .update(input.account_id, {
          entity: "organization_accounts",
          token: ctx.token.value,
          mutation: {
            params: {
              contact_status: input.account_status,
            },
            pluck: ["id"],
          },
        })
        .execute();

      return account;
    }),
});
