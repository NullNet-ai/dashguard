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

        switch (error?.message) {
          case "Invalid Credentials":
            errorMessage = "The email or password you entered is incorrect.";
            errorType = "invalid";
            break;
          case "Account not found":
            errorMessage = "No account was found with this email address.";
            errorType = " notfound";
            break;
        }

        return {
          message: errorMessage,
          statusCode: error?.status_code || 500,
          error: error?.errors || error,
          type: errorType,
        };
      }
    }),

  logout: privateProcedure.mutation(async ({ ctx }) => {
    ctx.storeCookies.delete("token");
    return { message: "User logged out" };
  }),
  verify: privateProcedure.mutation(async ({ ctx }) => {
    return {};
  }),
});
