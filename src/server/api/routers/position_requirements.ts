import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";

const ENTITY = "position_requirement";

export const positionRequirementsRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  createRequirements: privateProcedure
    .input(
      z.object({
        id: z.string(),
        requirement_type_id: z.string().optional(),
        requirement_description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, requirement_type_id, requirement_description } = input;
      const res = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              position_id: id,
              requirement_type_id,
              requirement_description,
            },
          },
        })
        .execute();

      return res;
    }),
  updateRequirements: privateProcedure
    .input(
      z.object({
        id: z.string(),
        requirement_type_id: z.string().optional(),
        requirement_description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, requirement_type_id, requirement_description } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              id,
              requirement_type_id,
              requirement_description,
            },
          },
        })
        .execute();

      return res;
    }),
  fetchRequirementsDetails: privateProcedure
    .input(
      z.object({
        pluck: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck } = input;
      const fetched_position_requirement_details = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            order: {
              starts_at: 0,
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
            pluck,
          },
        })
        .execute();

      return fetched_position_requirement_details?.data;
    }),
  fetchRequirementsByPositionIdDetails: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pluck, id } = input;
      const fetched_position_requirement_details = await ctx.dnaClient
        .findAll({
          entity: ENTITY,
          token: ctx.token.value,
          query: {
            advance_filters: [
              {
                type: "criteria",
                field: "position_id",
                operator: EOperator.EQUAL,
                values: [id],
              },
            ],
            order: {
              starts_at: 0,
              limit: 100,
              by_field: "created_date",
              by_direction: EOrderDirection.DESC,
            },
            pluck,
          },
        })
        .execute();

      return fetched_position_requirement_details?.data;
    }),
});
