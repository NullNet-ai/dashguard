import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const employmentTypeRouter = createTRPCRouter({
  ...createDefineRoutes("employment_type"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        employment_type: z
          .string()
          .min(1, { message: "Employment Type is required" })
          .nullable()
          .refine((val) => val !== null, {
            message: "Employment Type is required",
          }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const employment_type = await ctx.dnaClient
        .findAll({
          entity: "employment_type",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              employment_type: input?.employment_type || "",
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
        employment_type.data.length > 0 &&
        employment_type?.data[0]?.id !== input.id
      ) {
        const { id: existing_id, status } = employment_type?.data[0] || {};
        return {
          message: "Employment Type already exists",
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
                field: "employment_type",
                message: "Employment Type already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "employment_type",
          token: ctx.token.value,
          mutation: {
            params: {
              employment_type: input.employment_type,
            },
          },
        })
        .execute();

      return res;
    }),
  getEmploymentTypeOptions: privateProcedure.query(async ({ ctx }) => {
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
    const employment_type_options = await filter({
      entity: "employment_type",
      pluck: ["id", "employment_type"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return employment_type_options.data?.map((item) => {
      const { id, employment_type } = item;
      return {
        value: id,
        label: employment_type,
      };
    });
  }),
});
