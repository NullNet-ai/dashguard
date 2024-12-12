import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import {
  EOperator,
  EOrderDirection,
  type IAdvanceFilters,
} from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const positionRoleRouter = createTRPCRouter({
  ...createDefineRoutes("position_roles"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        position_role: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const position_role = await ctx.dnaClient
        .findAll({
          entity: "position_roles",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({
              position_role: input.position_role,
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
        position_role.data.length > 0 &&
        position_role?.data[0]?.id !== input.id
      ) {
        const { id: existing_id, status } = position_role?.data[0] || {};
        return {
          message: "Position Role already exists",
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
                field: "position_role",
                message: "Position Role already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "position_roles",
          token: ctx.token.value,
          mutation: {
            params: {
              position_role: input.position_role,
            },
          },
        })
        .execute();

      return res;
    }),
  getPositionRoleOptions: privateProcedure.query(async ({ ctx }) => {
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
    const position_role_options = await filter({
      entity: "position_roles",
      pluck: ["id", "position_role"],
      advance_filters: [
        {
          type: "criteria",
          field: "status",
          operator: EOperator.EQUAL,
          values: ["Active"],
        },
      ],
    });
    return position_role_options.data?.map((item) => {
      const { id, position_role } = item;
      return {
        value: id,
        label: position_role,
      };
    });
  }),
});
