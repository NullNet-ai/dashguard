import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const filesRouter = createTRPCRouter({
  getFileById: privateProcedure
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
          entity: "file",
          token: ctx.token.value,
          query: {
            pluck: input.pluck_fields,
          },
        })
        .execute();

      return record?.data;
    }),
});
