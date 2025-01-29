import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { privateProcedure } from "~/server/api/trpc";
import type Entities from "~/auto-generated/entities";
type Entity = (typeof Entities)[number];

export const createDefineRoutes = (entity: Entity) => ({
  createDraftRecord: privateProcedure.mutation(async ({ ctx }) => {
    const record = await ctx.dnaClient
      .create({
        entity,
        token: ctx.token.value,
        mutation: {
          params: {
            status: "draft",
          },
          pluck: ["id", "code"],
        },
      })
      .execute();
    if (!record) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `${entity} creation failed`,
      });
    }
    console.info("[Create Draft]", record);
    return {
      ...record,
      data: record?.data?.[0],
    };
  }),
  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  delete: privateProcedure
    ?.input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .update(input.id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              tombstone: 1,
              status: "Archived",
            },
            pluck: ["id"],
          },
        })
        .execute();
      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${entity} deletion failed`,
        });
      }
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  getByCode: privateProcedure
    .input(
      z.object({
        code: z.string(),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.code) return null;

      // Note: Temporary fix. Real code commented
      try {
        const record = await ctx.dnaClient
        .findByCode(input.code, {
          entity,
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return {
        ...record,
        data: record?.data?.[0],
      };
      } catch (error) {
        return {
          data: undefined,
          status_code: 404,
          message: "Record not found",
          success: false,
          error,
        } as Record<string, any>;
      }
    }),
  archivedRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const record = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: "Archived",
            },
            pluck: ["id"],
          },
        })
        .execute();

      if (!record) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${entity} archived failed`,
        });
      }
      console.info("[Archived data]", record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
});
