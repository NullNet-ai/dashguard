import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

const ENTITY = "position_types";

export const positionTypeRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updatePositionTypeRecord: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        position_type: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const position_type = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              position_type: input.position_type,
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
        position_type.data.length > 0 &&
        position_type?.data[0]?.id !== input.id
      ) {
        const { id: existing_id, status } = position_type?.data[0] || {};
        return {
          message: "Position Type already exists",
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
                field: "position_type",
                message: "Position Type already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              position_type: input.position_type,
            },
          },
        })
        .execute();

      return res;
    }),
  getPositionTypeOptions: privateProcedure.query(async ({ ctx }) => {
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
    const position_types = await filter({
      entity: ENTITY,
      pluck: ["id", "position_type"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return position_types.data?.map((item) => {
      const { id, position_type } = item;
      return {
        value: id,
        label: position_type,
      };
    });
  }),
});
