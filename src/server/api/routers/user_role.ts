import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOrderDirection } from "@dna-platform/common-orm";
import { createAdvancedFilter } from "~/server/utils/transformAdvanceFilter";

export const userRolesRouter = createTRPCRouter({
  ...createDefineRoutes("user_roles"),
  update: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const role = await ctx.dnaClient
        .findAll({
          entity: "user_roles",
          token: ctx.token.value,
          query: {
            pluck: ["id", "status"],
            advance_filters: createAdvancedFilter({ role: input.role }),
            order: {
              limit: 1,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
          },
        })
        .execute();

      if (role.data.length > 0 && role?.data[0]?.id !== input.id) {
        const { id: existing_id, status } = role?.data[0] || {};
        return {
          message: "Role already exists",
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
                field: "role",
                message: "Role already exists.",
              },
            ],
          },
        };
      }

      const res = await ctx.dnaClient
        .update(input.id, {
          entity: "user_roles",
          token: ctx.token.value,
          mutation: {
            params: {
              role: input.role,
            },
          },
        })
        .execute();

      return res;
    }),
});
