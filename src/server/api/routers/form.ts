import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

import { EStatus } from '../types';

export const formRouter = createTRPCRouter({
  createRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        fieldIdentifier: z.string(),
        data: z.record(z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              ...input.data,
              status: EStatus.ACTIVE,
            },
            pluck: ['id', input.fieldIdentifier],
          },
        })
        .execute()
        .catch((error) => {
          throw error;
        });

      const result = record?.data?.[0];

      return result
        ? {
            value: result?.id,
            label: result?.[input.fieldIdentifier],
          }
        : null;
    }),
  createDynamicRecord: privateProcedure
    .input(
      z.object({
        entity: z.string(),
        data: z.record(z.any()).optional(),
        pluck: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const record = await ctx.dnaClient
        .create({
          entity: input.entity,
          token: ctx.token.value,
          mutation: {
            params: {
              status: EStatus.ACTIVE,
              ...input.data,
            },
            pluck: input.pluck,
          },
        })
        .execute();
      return record;
    }),
  updateDynamicRecord: privateProcedure
    .input(
      z.object({
        id: z.string(),
        entity: z.string(),
        data: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data, entity } = input;
      const record = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: {
              ...data,
            },
          },
        })
        .execute();
      return record;
    }),
});
