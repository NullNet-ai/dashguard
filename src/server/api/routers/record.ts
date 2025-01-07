import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { IAdvanceFilters } from "@dna-platform/common-orm";

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
      const join_type = entity === "contact" ? "self" : "left" as "self" | "left" | "right" | "inner";
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
      const base_join = {
        type: join_type,
        field_relation:
          join_type === "self"
            ? {
                to: {
                  entity,
                  field: "created_by",
                },
                from: {
                  ...(join_type === "self" ? { alias: "created_by" } : {}),
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
                  entity: "contact",
                  field: "id",
                },
              },
      };
      const self_join = {
        type: join_type,
        field_relation: {
          to: {
            entity,
            field: "updated_by",
          },
          from: {
            ...(join_type === "self" ? { alias: "updated_by" } : {}),
            entity: "contact",
            field: "id",
          },
        },
      };
      const query = ctx.dnaClient.findAll(base_query).join(base_join);

      if (join_type === "self") {
        query.join(self_join);
      }

      const response = await query.execute();

      const { data } = response;

      if (data) {
        const [item] = data;
        if (item) {
          let formatted_data;
          if (entity === "contact") {
            const { contacts, created_by, updated_by } = item;
            formatted_data = {
              ...response,
              data: {
                ...contacts,
                created_by_data: {
                  first_name: created_by.first_name,
                  last_name: created_by.last_name,
                },
                updated_by_data: {
                  first_name: updated_by.first_name,
                  last_name: updated_by.last_name,
                },
              },
            };
          } else {
            //THIS IS TEMPORARY SINCE THE DOUBLE JOIN OF THE SAME ENTITY IS STILL AN ISSUE IN TH DB SIDE
            const { contacts, [entity + "s"]: entity_data } = item;
            const updated_by_response = await ctx.dnaClient
              .findOne(entity_data.updated_by, {
                entity: "contact",
                token: ctx.token.value,
                query: {
                  pluck: ["first_name", "last_name"],
                },
              })
              .execute();
            formatted_data = {
              ...response,
              data: {
                ...entity_data,
                created_by_data: {
                  first_name: contacts.first_name,
                  last_name: contacts.last_name,
                },
                updated_by_data: {
                  first_name: updated_by_response?.data?.[0]?.first_name,
                  last_name: updated_by_response?.data?.[0]?.last_name,
                },
              },
            };
            return formatted_data;
          }
          return formatted_data;
        }
      }
      return response;
    }),
  getSessionInfo: privateProcedure.query(async ({ ctx }) => {
    const response = ctx.session.account;
    const advance_filters = createAdvancedFilter({
      contact_id: response.contact.id,
    });
    const { data } = await ctx.dnaClient
      .findAll({
        entity: "contact_email",
        token: ctx.token.value,
        query: {
          advance_filters,
          pluck: ["id", "email"],
        },
      })
      .execute();
    return {
      contact: { ...response?.contact, email: data?.[0]?.email },
      organization: { ...response.organization },
    };
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
});
