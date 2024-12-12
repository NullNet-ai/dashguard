import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const payPeriodRouter = createTRPCRouter({
  ...createDefineRoutes("pay_period"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pay_period: z
          .string()
          .min(1, { message: "Pay Period is required" })
          .nullable()
          .refine((val) => val !== null, { message: "Pay Period is required" }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const pay_period = await ctx.dnaClient
        .findAll({
          entity: "pay_period",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              pay_period: input?.pay_period || "",
            }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (pay_period.data.length > 0 && pay_period?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = pay_period?.data[0] || {};
        return {
          message: "Pay Period already exists",
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
                field: "pay_period",
                message: "Pay Period already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "pay_period",
          token: ctx.token.value,
          mutation: {
            params: {
              pay_period: input.pay_period,
            },
          },
        })
        .execute();

      return res;
    }),
  getPayPeriodOptions: privateProcedure.query(async ({ ctx }) => {
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
    const pay_period_options = await filter({
      entity: "pay_period",
      pluck: ["id", "pay_period"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return pay_period_options.data?.map((item) => {
      const { id, pay_period } = item;
      return {
        value: id,
        label: pay_period,
      };
    });
  }),
});
