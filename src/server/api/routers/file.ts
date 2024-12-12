import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const fileRouter = createTRPCRouter({
  get: privateProcedure
    .input(
      z.object({
        advance_filter: z.array(
          z.object({
            type: z.string(),
            field: z.string().optional(),
            operator: z.string(),
            values: z.array(z.string()).optional(),
          }),
        ),
      }),
    )
    .query(async ({ ctx, input }) => {
      const token = ctx.token.value;
      const response = await ctx.dnaClient
        .findAll({
          entity: "files",
          query: {
            advance_filters: input.advance_filter as any,
            pluck: ["filename", "filepath", "mimetype"],
          },
          token,
        })
        .execute();

      return response;
    }),
});
