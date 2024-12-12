import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const timezonesRouter = createTRPCRouter({
  ...createDefineRoutes("timezone"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        timezone: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const timezone = await ctx.dnaClient
        .findAll({
          entity: "timezone",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              timezone: input.timezone,
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (timezone.data.length > 0 && timezone?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = timezone?.data[0] || {};
        return {
          message: "timezone already exists",
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
                field: "timezone",
                message: "timezone already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "timezone",
          token: ctx.token.value,
          mutation: {
            params: {
              timezone: input.timezone,
            },
          },
        })
        .execute();

      return res;
    }),
  fetchAlltimezone: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck } = input;
      const res = await ctx.dnaClient
        .findAll({
          entity: "timezone",
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters: createAdvancedFilter({ status: "Active" }),
          },
        })
        .execute();
      return res;
    }),
});
