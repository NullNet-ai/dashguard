import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const remindersRouter = createTRPCRouter({
  ...createDefineRoutes("reminder"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        reminder: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const reminder = await ctx.dnaClient
        .findAll({
          entity: "reminder",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              reminder: input.reminder,
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (reminder.data.length > 0 && reminder?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = reminder?.data[0] || {};
        return {
          message: "Reminder already exists",
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
                field: "reminder",
                message: "Reminder already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "reminder",
          token: ctx.token.value,
          mutation: {
            params: {
              reminder: input.reminder,
            },
          },
        })
        .execute();

      return res;
    }),
  fetchAllReminders: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck } = input;
      const res = await ctx.dnaClient
        .findAll({
          entity: "reminder",
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
