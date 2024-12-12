import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import ZodItems from "~/server/zodSchema/grid/items";
import { z } from "zod";
import { ReportFiltersFormSchema } from "~/server/zodSchema/report_filters/reportFilterDetails";

const entity = "report_filters";
export const reportFiltersRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  fetchReportFilters: privateProcedure
    .input(ZodItems.extend({ report_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const report_filters = await ctx.dnaClient
        .findAll({
          entity: entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters: [
              {
                type: "criteria",
                field: "report_id",
                operator: EOperator.EQUAL,
                values: [input.report_id],
              },
            ],
            order: {
              limit: input.limit || 50,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      return report_filters;
    }),
  updateReportFilters: privateProcedure
    .input(ReportFiltersFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { filters } = input;

      if (filters.length) {
        const response = await Promise.all(
          filters.map(async (filter) => {
            const record = await ctx.dnaClient
              .create({
                entity,
                token: ctx.token.value,
                mutation: {
                  params: {
                    ...filter,
                    status: "Active",
                  },
                  pluck: ["id", "code"],
                },
              })
              .execute();

            return record?.data?.[0];
          }),
        );

        console.info("[Create Report Filter]", response);
        return {
          data: response,
        };
      }

      return {
        data: [],
      };
    }),
});
