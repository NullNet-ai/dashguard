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
      try {
        const response = await ctx.dnaClient
          .login(input.email, input.password)
          .execute();

        if (!response.success) {
          throw response;
        }

        const token = response?.data?.[0]?.token;

        ctx.storeCookies.set("token", token);
        return { token };
      } catch (error: any) {
        let errorMessage = "Something went wrong please try again";
        let errorType = "unknown";

        if (
          input.email === "admin@dnamicro.com" &&
          error?.response?.status === undefined
        ) {
          errorMessage = "The email or password you entered is incorrect.";
          errorType = "invalid";
        } else if (input.email !== "admin@dnamicro.com") {
          errorMessage = "No account was found with this email address.";
          errorType = "notfound";
        }

        return {
          message: errorMessage,
          statusCode: error?.response?.status || 500,
          error: error?.response?.error || error,
          type: errorType,
        };
      }
    }),

  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete("token");
    return { message: "User logged out" };
  }),
});
