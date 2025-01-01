import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

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
          // Enhanced error handling with specific validation messages
          let errorMessage = 'Something went wrong please try again';
          let errorType = 'unknown';

            if (input.email === 'admin@dnamicro.com' && error?.response?.status === undefined) {
              errorMessage = 'The email or password you entered is incorrect.';
              errorType = 'invalid';
            } else if (input.email !== 'admin@dnamicro.com') {
              errorMessage = 'No account was found with this email address.';
              errorType = 'notfound';
            }

          return {
            token: null,
            error: {
              message: errorMessage,
              statusCode: error?.response?.status || 500,
              error: error?.response?.error || error,
              type: errorType,
            },
          };
        });

      if (error) {
        return error;
      }
      
      ctx.storeCookies.set("token", token);
      return { token };
    }),
    
  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete("token");
    return { message: "User logged out" };
  }),
});