import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";

import ZodItems from "~/server/zodSchema/grid/items";
import { ReportSortingFormSchema } from "~/server/zodSchema/reports/reportSortingDetails";
import { entityFormSchema } from "~/server/zodSchema/reports/entityFormSchema";

const entity = "reports";
export const reportsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  fetchReports: privateProcedure
    .input(ZodItems)
    .query(async ({ ctx, input }) => {
      const reports = await ctx.dnaClient
        .findAll({
          entity: entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck,
            advance_filters: [
              // {
              //   type: "criteria",
              //   field: "status",
              //   operator: EOperator.EQUAL,
              //   values: ["Draft"],
              // },
            ],
            order: {
              limit: input.limit || 50,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      return reports;
    }),
  updateReportSorting: privateProcedure
    .input(ReportSortingFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { order_key, order_direction } = input;
      return ctx.dnaClient
        .update(input.id, {
          entity: "reports",
          token: ctx.token.value,
          mutation: {
            params: {
              order_key,
              order_direction,
            },
          },
        })
        .execute();
    }),
  updateReportBasicDetails: privateProcedure
    .input(
      entityFormSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { report_name, entity_name } = input;
      return ctx.dnaClient
        .update(input.id, {
          entity: "reports",
          token: ctx.token.value,
          mutation: {
            params: {
              report_name,
              entity_name,
            },
          },
        })
        .execute();
    }),
  updateReportColumns: privateProcedure
    .input(
      z.object({ id: z.string(), columns: z.array(z.string().optional()) }),
    )
    .mutation(async ({ input, ctx }) => {
      const { columns } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: "reports",
          token: ctx.token.value,
          mutation: {
            params: {
              columns,
            },
          },
        })
        .execute();
    }),
});
