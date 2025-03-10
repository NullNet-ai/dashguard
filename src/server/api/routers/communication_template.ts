import { createTRPCRouter, privateProcedure , publicProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from '../baseCrud';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';


const ENTITY = 'communication_template'

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
});