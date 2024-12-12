import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const countryRouter = createTRPCRouter({
  ...createDefineRoutes("country"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        country: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const country = await ctx.dnaClient
        .findAll({
          entity: "country",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({ country: input.country }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (country.data.length > 0 && country?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = country?.data[0] || {};
        return {
          message: "Country already exists",
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
                field: "country",
                message: "Country already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "country",
          token: ctx.token.value,
          mutation: {
            params: {
              country: input.country,
            },
          },
        })
        .execute();

      return res;
    }),
  getCountryOptions: privateProcedure.query(async ({ ctx }) => {
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
    const country_options = await filter({
      entity: "country",
      pluck: ["id", "country"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return country_options.data?.map((item) => {
      const { id, country } = item;
      return {
        value: id,
        label: country,
      };
    });
  }),
});
