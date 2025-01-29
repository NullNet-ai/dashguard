import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import Entities from "~/auto-generated/entities";
import { EStatus } from "../types";
import { headers } from "next/headers";
import { TRPCError } from "@trpc/server";

export const wizardRouter = createTRPCRouter({
  // This function here is save step in redis
  wizardCreateStep: privateProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        step: z.string().min(1),
        entity: z.string().refine(
          (value) => {
            return Entities.includes(value);
          },
          {
            message:
              "Invalid entity name. It must be one of the DnaOrm models.",
          },
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx?.redisClient.cacheData(
        `wizard_${input.entity}:${input.identifier}`,
        input?.step,
      );
      return res;
    }),
  // This function here is get step from redis
  getCurrentStep: privateProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        entity: z.string().refine(
          (value) => {
            return Entities.includes(value);
          },
          {
            message:
              "Invalid entity name. It must be one of the DnaOrm models.",
          },
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx?.redisClient.getCachedData(
        `wizard_${input.entity}:${input.identifier}`,
      );
      return {
        identifier: input.identifier,
        entity: input.entity,
        step: res || 1,
      };
    }),
  // This function here is activate the entity last step
  activator: privateProcedure
    .input(
      z.object({
        identifier: z.string().min(1),
        entity: z.string().refine(
          (value) => {
            //activate it here
            return Entities.includes(value);
          },
          {
            message:
              "Invalid entity name. It must be one of the DnaOrm models.",
          },
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .findByCode(input.identifier, {
          entity: input.entity,
          token: ctx.token.value,
          query: {
            pluck: ["id"],
          },
        })
        .execute();
      const record_id = record?.data?.[0]?.id;
      if (!record_id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Record not found",
        });
      }

      await ctx.dnaClient
        .update(record_id, {
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ACTIVE,
            },
            pluck: ["id", "code"],
          },
        })
        .execute();

      const recordFound = await ctx.dnaClient
        .findOne(input.identifier, {
          entity: input.entity,
          token: ctx.token.value,
          query: {
            pluck: ["id", "code"],
          },
        })
        .execute();

      return recordFound;
    }),
  // This function here is create the entity for Save and New button
  createEntity: privateProcedure
    .input(
      z.object({
        entity: z.string().refine(
          (value) => {
            return Entities.includes(value);
          },
          {
            message:
              "Invalid entity name. It must be one of the DnaOrm models.",
          },
        ),
        defaultValues: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const hasDefaultValue = input.defaultValues ? input.defaultValues : {};
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Draft",
              ...hasDefaultValue,
            },
            pluck: ["id", "code"],
          },
        })
        .execute();
      await ctx?.redisClient.cacheData(
        `wizard_${input.entity}:${record?.data?.[0]?.id}`,
        JSON.stringify(1),
      );
      return record;
    }),
  saveTraverseStepped: privateProcedure
    .input(
      z.object({
        key: z.string(),
        pathname: z.string(),
        currentStep: z.number(),
        traverse: z.record(z.literal("Stepped")),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // save the steps here
      // 2 weeks = 1209600 seconds
      await ctx?.redisClient.cacheData(`step_${input.key}`, input, 1209600);
      return input;
    }),
  getTraverseStepped: privateProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const res = await ctx?.redisClient.getCachedData(`step_${input}`);
      return res as {
        key: string;
        pathname: string;
        currentStep: number;
        traverse: Record<string, "Stepped">;
      };
    }),
});
