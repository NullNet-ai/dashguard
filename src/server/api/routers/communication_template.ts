import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { pluralize } from '~/server/utils/pluralize';

const ENTITY = 'communication_template';

export const communicationTemplateRouter = createTRPCRouter({
  ...createDefineRoutes(ENTITY),
  updateDraftTemplate: privateProcedure
    .input(
      z.object({
        name: z.string(),
        id: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        const record = await ctx.dnaClient
          .update(input.id, {
            entity: ENTITY,
            token: ctx.token.value,
            mutation: {
              params: {
                name: input.name,
              },
              pluck: ['id', 'name', 'code'],
            },
          })
          .execute();
        if (!record) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `${ENTITY} update failed`,
          });
        }
        console.info('[Update Draft Account]', record);
        return {
          ...record,
          data: record?.data?.[0],
        };
      }
      const record = await ctx.dnaClient
        .create({
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              name: input.name,
              status: 'Draft',
            },
            pluck: ['id', 'code', 'name'],
          },
        })
        .execute();
      if (!record) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `${ENTITY} creation failed`,
        });
      }
      console.info('[Create Draft Template]', record);
      return {
        ...record,
        data: record?.data?.[0],
      };
    }),
  fetchVariables: privateProcedure
    .input(
      z.object({
        entity: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const variables = (await ctx.redisClient.getHashValue(
        `schema:${pluralize(input?.entity)}`,
        'formatted_with_related_fields',
      )) as any;
      if (!variables) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Variables not found',
        });
      }
      console.info('[Fetch Variables]', variables);
      return {
        data: variables,
      };
    }),
});
