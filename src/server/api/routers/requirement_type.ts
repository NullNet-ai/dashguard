import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const requirementTypeRouter = createTRPCRouter({
  ...createDefineRoutes("requirement_type"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        requirement_type: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const requirement_type = await ctx.dnaClient
        .findAll({
          entity: "requirement_type",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              requirement_type: input.requirement_type,
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (
        requirement_type.data.length > 0 &&
        requirement_type?.data[0]?.id !== input.id
      ) {
        const { id: existing_id, status } = requirement_type?.data[0] || {};
        return {
          message: "Requirement Type already exists",
          data: [],
          status_code: 409,
          total_count: 0,
          record_count: 0,
          existing: true,
          existing_record: {
            id: existing_id,
            status,
          },
          errors: {
            form: [
              {
                field: "requirement_type",
                message: "Requirement Type already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "requirement_type",
          token: ctx.token.value,
          mutation: {
            params: {
              requirement_type: input.requirement_type,
            },
          },
        })
        .execute();

      return res;
    }),

  fetchAllRequirementTypes: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { pluck } = input;
      const requirement_type = await ctx.dnaClient
        .findAll({
          entity: "requirement_type",
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "status",
                operator: EOperator.EQUAL,
                values: ["Active"],
              },
            ],
            pluck,
            order: {
              starts_at: 0,
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      return requirement_type;
    }),
});
