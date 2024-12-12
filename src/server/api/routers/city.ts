import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const cityRouter = createTRPCRouter({
  ...createDefineRoutes("city"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        city: z.string().min(1),
        country_id: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { country_id, city } = input;
      if (city) {
        const advance_filters = createAdvancedFilter({
          city,
          country_id,
        });

        const _city = await ctx.dnaClient
          .findAll({
            entity: "city",
            token: ctx.token.value,
            query: {
              pluck: ["id", "status"],
              advance_filters,
              order: {
                limit: 1,
                by_field: "created_date",
                by_direction: EOrderDirection.DESC,
              },
            },
          })
          .execute();
        const city_data_id = _city?.data?.[0]?.id || null;

        if (city_data_id && city_data_id !== input.id) {
          const { id: existing_id, status } = _city?.data[0] || {};
          return {
            message: "City already exists",
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
                  field: "city",
                  message: "Name already exists.",
                },
              ],
            },
          };
        }
      }
      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "city",
          token: ctx.token.value,
          mutation: {
            params: {
              city: city,
              country_id,
            },
          },
        })
        .execute();

      return res;
    }),
});
