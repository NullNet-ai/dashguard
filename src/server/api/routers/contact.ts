import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation
import { ContactCategoryDetailsSchema } from "~/server/zodSchema/contact/categoryDetails";

const ENTITY = "contact";

export const contactRouter = createTRPCRouter({
  updateBasiDetails: privateProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pluck_fields: z.array(z.string()),
        main_entity: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!input?.id) return null;
      const record = await ctx.dnaClient
        .findOne(input.id, {
          entity: input.main_entity,
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
  updateCategoryDetails: privateProcedure
    .input(
      ContactCategoryDetailsSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { categories } = input;

      return ctx.dnaClient
        .update(input.id, {
          entity: ENTITY,
          token: ctx.token.value,
          mutation: {
            params: {
              categories: [...new Set([categories, "Contact"])],
            },
          },
        })
        .execute();
    }),
});
