import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const workSetupRouter = createTRPCRouter({
  ...createDefineRoutes("work_setup"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        work_setup: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const work_setup = await ctx.dnaClient
        .findAll({
          entity: "work_setup",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              work_setup: input.work_setup,
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (work_setup.data.length > 0 && work_setup?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = work_setup?.data[0] || {};
        return {
          message: "Work Setup already exists",
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
                field: "work_setup",
                message: "Work Setup already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "work_setup",
          token: ctx.token.value,
          mutation: {
            params: {
              work_setup: input.work_setup,
            },
          },
        })
        .execute();

      return res;
    }),
  fetchAllWorkSetup: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()),
        entity: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck, entity } = input;
      const res = await ctx.dnaClient
        .findAll({
          entity,
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
