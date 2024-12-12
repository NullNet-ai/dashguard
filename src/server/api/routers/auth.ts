import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod"; // Zod is used for input validation

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { token, error } = await ctx.dnaClient
        .login(input.email, input.password)
        .execute()
        .then((response) => {
          return {
            // @ts-expect-error - TS doesn't know about the ctx type
            token: response.data?.[0].token,
            error: null,
          };
        })
        .catch((error) => {
          return {
            token: null,
            error: {
              message: error?.response?.message ? 'Something went wrong please try again' : 'Invalid email and password',
              statusCode: error?.response?.statusCode ? error?.response?.statusCode : 500,
              error: error?.response?.error ? error?.response?.error : error,
            },
          };
        });

      if (error) {
        throw error;
      }
      ctx.storeCookies.set("token", token);
      return { token };
    }),
  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete("token");
    return { message: "User logged" };
  }),
});
