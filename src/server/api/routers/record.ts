import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { EOperator, IResponse } from "@dna-platform/common-orm";

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
          data: recordByCode?.data?.[0],
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
      const response = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "code",
                operator: EOperator.EQUAL,
                values: [id],
              },
            ],
            pluck: pluck_fields,
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact",
              field: "id",
            },
            from: {
              entity,
              field: "created_by",
            },
          },
        })
        /*
        Note: If same entity already exist w/ previous join's entity, it will throw an error.
        For now, will create another TRPC request to sastisfy it.
        */
        // .join({
        //   type: "left",
        //   field_relation: {
        //     to: {
        //       entity: "contact",
        //       field: "id",
        //     },
        //     from: {
        //       entity,
        //       field: "updated_by",
        //     },
        //   },
        // })
        .execute();
      const { data } = response;
      if (data) {
        const [item] = data;
        if (item) {
          const { organizations, contacts } = item;
          const { updated_by } = organizations;
          const { first_name, last_name } = contacts;
          let formatted_data = {
            ...response,
            data: {
              ...organizations,
              created_by_data: {
                first_name,
                last_name,
              },
            },
          };
          if (updated_by) {
            const response = await ctx.dnaClient
              .findOne(updated_by, {
                entity: "contact",
                token: ctx.token.value,
                query: {
                  pluck: ["id", "first_name", "last_name"],
                },
              })
              .execute();
            const {
              data: [item],
            } = response;
            formatted_data = {
              ...formatted_data,
              data: {
                ...formatted_data.data,
                updated_by_data: item,
              },
            };
          }
          return formatted_data;
        }
      }
      return response;
    }),
  getSessionInfo: privateProcedure.query(async ({ ctx }) => {
    const response = ctx.session.account;
    return response;
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
