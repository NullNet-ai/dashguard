import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { createAdvancedFilter } from "../../utils/transformAdvanceFilter";
import { PositionBenefitsSchema } from "../../zodSchema/positions/positionBenefits";

const ENTITY = "position_benefits";

export const positionBenefitsRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  saveBenefits: privateProcedure
    .input(
      PositionBenefitsSchema.extend({
        position_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const { benefits = [], position_id } = input;

      if (!benefits.length) return true;

      const updated_ids: string[] = [];

      const getBenefitByPositionId = async (position_id: string) => {
        const advance_filters = createAdvancedFilter({
          position_id,
          status: "Active",
        });

        const response = await ctx.dnaClient
          .findAll({
            entity: ENTITY,
            query: {
              advance_filters,
              pluck: ["id", "benefit_id", "position_id"],
            },
            token,
          })
          .execute();

        return response?.data || [];
      };

      // Fetch existing benefits for the contact
      const existing_benefits = await getBenefitByPositionId(position_id);

      // Process each benefits: update existing or create new
      for (const benefit of benefits) {
        const current_position_benefit_id = benefit.id;
        const benefit_id = benefit.benefit_id;

        const existing = existing_benefits.find(
          (existing) => existing.id === current_position_benefit_id,
        );

        if (existing) {
          // Update existing record
          // Nothing to update here
          updated_ids.push(current_position_benefit_id);
        } else {
          // Create a new file
          const response = await ctx.dnaClient
            .create({
              entity: ENTITY,
              token,
              mutation: {
                params: {
                  id: current_position_benefit_id,
                  benefit_id,
                  position_id,
                  status: "Active",
                },
                pluck: ["id"],
              },
            })
            .execute();

          const { data } = response;
          const [_benefit] = data;
          if (_benefit?.id) {
            updated_ids.push(_benefit.id);
          }
        }
      }

      // Archive benefits that are no longer present in the updated files
      for (const file of existing_benefits) {
        if (!updated_ids.includes(file.id)) {
          await ctx.dnaClient
            .update(file.id, {
              entity: ENTITY,
              token,
              mutation: {
                params: {
                  tombstone: 1,
                  status: "Archived",
                },
                pluck: ["id"],
              },
            })
            .execute();
        }
      }

      // Return whether there are valid updated IDs
      return !!updated_ids.filter(Boolean).length;
    }),
  getPositionBenefitsByPositionId: privateProcedure
    .input(
      z.object({
        position_id: z.string(),
        pluck_fields: z.array(z.string()),
        advance_filters: z.object({})?.optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { advance_filters = {} } = input;
      const _advance_filters = createAdvancedFilter({
        ...advance_filters,
        position_id: input.position_id,
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
        .execute();

      return res.data || [];
    }),
});
