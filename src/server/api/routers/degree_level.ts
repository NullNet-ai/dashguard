import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
    EOperator,
    EOrderDirection,
    type IAdvanceFilters,
  } from "@dna-platform/common-orm";
  import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const degreeLevelRouter = createTRPCRouter({
  ...createDefineRoutes("degree_levels"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        degree_level: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const degree_level = await ctx.dnaClient
        .findAll({
          entity: "degree_levels",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({ degree_level: input.degree_level }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (degree_level.data.length > 0 && degree_level?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = degree_level?.data[0] || {};
        return {
          message: "Degree Level already exists",
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
                field: "degree_level",
                message: "Degree Level already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "degree_levels",
          token: ctx.token.value,
          mutation: {
            params: {
              degree_level: input.degree_level,
            },
          },
        })
        .execute();

      return res;
    }),
    getDegreeLevelOptions: privateProcedure.query(async ({ ctx }) => {
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
        const degree_levels = await filter({
          entity: "degree_levels",
          pluck: ["id", "degree_level"],
          advance_filters: [
            {
              type: "criteria",
              field: "status",
              operator: EOperator.EQUAL,
              values: ["Active"],
            },
          ],
        });
        return degree_levels.data?.map((item) => {
          const { id, degree_level } = item;
          return {
            value: id,
            label: degree_level,
          };
        });
      }),
});
