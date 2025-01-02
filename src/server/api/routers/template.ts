import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";

const entity = "";

export const templateRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  updateName: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      const res = await ctx.dnaClient
        .update(id, {
          entity,
          token: ctx.token.value,
          mutation: {
            params: rest,
          },
        })
        .execute();

      return res;
    }),
});
