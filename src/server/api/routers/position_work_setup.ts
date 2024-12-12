import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
import { z } from "zod";
import { EOperator, EOrderDirection } from "@dna-platform/common-orm";

const ENTITY = "position_work_setup";

export const positionWorkSetupsRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  createWorkSetup: privateProcedure
    .input(
      z.object({
        id: z.string(),
        work_setup_id: z.string(),
        countries: z.array(z.string()),
        exceptions: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, work_setup_id, countries, exceptions } = input;
      const res = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              position_id: id,
              work_setup_id,
              countries,
              exceptions,
            },
          },
        })
        .execute();

      return res;
    }),
  updateWorkSetup: privateProcedure
    .input(
      z.object({
        id: z.string(),
        work_setup_id: z.string(),
        countries: z.array(z.string()),
        exceptions: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, work_setup_id, countries, exceptions } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              id,
              work_setup_id,
              countries,
              exceptions,
            },
          },
        })
        .execute();

      return res;
    }),
  fetchWorkSetupDetails: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const fetched_position_work_setup = await ctx.dnaClient
        .findAll({
          entity: "position_work_setup",
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
            pluck: ["id", "work_setup_id", "countries", "exceptions"],
          },
        })
        .join({
          type: "left",
          field_relation: {
            to: {
              entity: "work_setup",
              field: "id",
            },
            from: {
              entity: "position_work_setup",
              field: "work_setup_id",
            },
          },
        })

        .execute();

      return fetched_position_work_setup?.data;
    }),
});
