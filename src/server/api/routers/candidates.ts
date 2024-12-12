import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";

const ENTITY = "candidate";

export const candidatesRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateCandidatesRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
        benefit_id: z.string(),
        position_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { benefit_id, position_id, id } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Active",
              benefit_id,
              position_id,
            },
          },
        })
        .execute();

      return res;
    }),
  getCandidates: privateProcedure
    .input(
      z.object({
        pluck_fields: z.array(z.string()).optional(),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {} } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
      });
      const res = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: _advance_filters,
            pluck: input.pluck_fields,
          },
        })
        // .join({
        //   type: "left",
        //   field_relation: {
        //     to: {
        //       entity: "candidates",
        //       field: "id",
        //     },
        //     from: {
        //       entity: "bookings",
        //       field: "candidate_id",
        //     },
        //   },
        // })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "contact",
              field: "id",
            },
            from: {
              entity: "candidate",
              field: "contact_id",
            },
          },
        })
        .execute();

      const { data = [], success } = res || {};
      if (!success) return [];

      const formatted_candidates = data.map((candidate) => {
        const { candidates, contacts } = candidate || {};
        const contact = Object.keys(contacts).reduce((acc, key) => {
          const _key = `contact_${key}` as string;
          return {
            ...acc,
            [_key]: contacts[key],
          };
        }, {});

        return {
          ...candidates,
          ...contact,
        };
      });

      return formatted_candidates || [];
    }),
});
