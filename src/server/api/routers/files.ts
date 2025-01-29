import Bluebird from "bluebird";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const filesRouter = createTRPCRouter({
  getFileById: privateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        pluck_fields: z.array(z.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { ids, pluck_fields } = input;
      if (!ids?.length) return null;
      const response = await Bluebird.map(ids, async (id) => {
        const record = await ctx.dnaClient
          .findOne(id, {
            entity: "file",
            token: ctx.token.value,
            query: {
              pluck: pluck_fields,
            },
          })
          .execute();

        return record?.data?.[0];
      }).filter(Boolean);
      return response;
    }),
});
