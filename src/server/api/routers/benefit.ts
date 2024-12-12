import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";
import { EStatus } from "../types";

const entity = "benefit";
export const benefitRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        benefit: z.string().min(1, { message: "Benefit is required" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const benefit = await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              benefit: input?.benefit || "",
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (benefit.data.length > 0 && benefit?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = benefit?.data[0] || {};
        return {
          message: "Benefit already exists",
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
                field: "benefit",
                message: "Benefit already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              benefit: input.benefit,
            },
          },
        })
        .execute();

      return res;
    }),
  getBenefitOptions: privateProcedure.query(async ({ ctx }) => {
    const filter = async ({
      entity,
      pluck,
      advance_filters,
      limit,
    }: {
      entity: string;
      pluck: string[];
      advance_filters: IAdvanceFilters<string | number>[];
      limit?: number;
    }) => {
      return await ctx.dnaClient
        .findAll({
          entity,
          token: ctx.token.value,
          query: {
            pluck,
            advance_filters,
            order: {
              limit: limit || 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();
    };
    const benefit_options = await filter({
      entity,
      pluck: ["id", "benefit"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return benefit_options.data?.map((item) => {
      const { id, benefit } = item;
      return {
        value: id,
        label: benefit,
      };
    });
  }),
});
