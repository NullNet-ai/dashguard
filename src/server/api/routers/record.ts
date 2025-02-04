import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { EOperator, type IAdvanceFilters } from "@dna-platform/common-orm";
import { TRPCError } from "@trpc/server";
import Entities from "~/auto-generated/entities";

export const recordRouter = createTRPCRouter({
  getById: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: input.main_entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
    }),

  getByCode: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      try {
        const recordByCode = await ctx.dnaClient
          .findByCode(input.id, {
            entity: input.main_entity,
            token: ctx.token.value,
            query: {
              pluck: input.pluck_fields,
            },
          })
          .execute();
        const { data, ...rest } = recordByCode ?? {};
        return {
          ...rest,
          data: data?.[0],
        };
      } catch (error) {
        return {
          data: undefined,
          status_code: 404,
          message: "Record not found",
          success: false,
          error,
        } as Record<string, any>;
      }
    }),
  getByCodeWithJoin: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, pluck_fields, main_entity: entity } = input;
      const join_type =
        entity === "contact"
          ? "self"
          : ("left" as "self" | "left" | "right" | "inner");
      const base_query = {
        entity,
        token: ctx.token.value,
        query: {
          advance_filters: [
            {
              type: "criteria",
              field: "code",
              operator: "equal",
              values: [id],
            },
          ] as IAdvanceFilters<string | number>[],
          pluck_object: {
            [`${entity}s`]: pluck_fields,
            ...(join_type === "self"
              ? {}
              : { contacts: ["first_name", "last_name"] }),
          },
        },
      };
      const created_by_join = {
        type: join_type,
        field_relation:
          join_type === "self"
            ? {
                to: {
                  entity,
                  field: "created_by",
                },
                from: {
                  ...(join_type === "self" ? { alias: "created_by_data" } : {}),
                  entity: "contact",
                  field: "id",
                },
              }
            : {
                from: {
                  entity,
                  field: "created_by",
                },
                to: {
                  ...(join_type === "left" ? { alias: "created_by_data" } : {}),
                  entity: "contact",
                  field: "id",
                },
              },
      };
      const updated_by_join = {
        type: join_type,
        field_relation:
          join_type === "self"
            ? {
                to: {
                  entity,
                  field: "updated_by",
                },
                from: {
                  ...(join_type === "self" ? { alias: "updated_by_data" } : {}),
                  entity: "contact",
                  field: "id",
                },
              }
            : {
                from: {
                  entity,
                  field: "updated_by",
                },
                to: {
                  ...(join_type === "left" ? { alias: "updated_by_data" } : {}),
                  entity: "contact",
                  field: "id",
                },
              },
      };
      const query = ctx.dnaClient
        .findAll(base_query)
        .join(created_by_join)
        .join(updated_by_join);

      const response = await query.execute();

      const { data } = response;

      const {
        created_by_data,
        updated_by_data,
        [entity + "s"]: entity_data,
      } = data?.[0] ?? {};
      const formatted_data = {
        ...response,
        data: {
          ...entity_data,
          created_by_data,
          updated_by_data,
        },
      };
      return formatted_data;
    }),
  getSessionInfo: privateProcedure.query(async ({ ctx }) => {
    const response = ctx.session.account;
    const accounts = await ctx.dnaClient
      .findAll({
        entity: "organization_accounts",
        token: ctx.token.value,
        query: {
          advance_filters: [
            {
              type: "criteria",
              field: "account_id",
              operator: EOperator.EQUAL,
              values: [response.email],
            },
          ],
          pluck_object: {
            organization_accounts: [
              "id",
              "organization_id",
              "account_id",
              "contact_id",
              "status",
            ],
            contacts: ["id", "first_name", "last_name"],
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
            entity: "organizations",
            field: "id",
          },
          from: {
            entity: "organization_accounts",
            field: "organization_id",
          },
        },
      })
      .execute();
    const { organization_accounts, contacts, organizations } = accounts.data?.[0] ?? {};
    const accountDetails = {
      account_name: `${contacts?.first_name || ""} ${contacts?.last_name || ""}`,
      username: organization_accounts?.account_id || "",
      organization: organizations?.name || "",
    };
    const advance_filters = createAdvancedFilter({
      organization_contact_id: response.contact.id,
    });
    const { data } = await ctx.dnaClient
      .findAll({
        entity: "organization_contact_account",
        token: ctx.token.value,
        query: {
          advance_filters,
          pluck: ["id", "email"],
        },
      })
      .execute();
    return accountDetails;
  }),
  archiveRecord: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        entity: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Archived",
            },
          },
        })
        .execute();
    }),
  updateRecordState: privateProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        entity: z.string().refine(
          (value) => {
            return Entities.includes(value);
          },
          {
            message:
              "Invalid entity name. It must be one of the DnaOrm models.",
          },
        ),
        status: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .findByCode(input.identifier, {
          entity: input.entity,
          token: ctx.token.value,
          query: {
            pluck: ["id"],
          },
        })
        .execute();
      const record_id = record?.data?.[0]?.id;
      if (!record_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }

      await ctx.dnaClient
        .update(record_id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: input.status,
            },
            pluck: ["id", "code"],
          },
        })
        .execute();
    }),
  updateDynamicRecord: privateProcedure
    .input(
      z.object({
        entity: z.string().min(1),
        id: z.string().min(1),
        data: z.object({}),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.dnaClient
        .update(input.id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: input.data,
          },
        })
        .execute();
    }),
});
