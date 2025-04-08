// import z from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  // privateProcedure
} from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
const entity = "";
export const organizationAccountRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
  getAccountID: privateProcedure.mutation(async ({ ctx }) => {
    const { contact } = ctx.session.account || {}
    return { account_id: contact?.id, token: ctx.token.value };
  })
});
