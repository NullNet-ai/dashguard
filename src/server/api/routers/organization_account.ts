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

    console.log('%c Line:13 🍋', 'color:#465975', ctx.session.account);
    const { contact, id } = ctx.session.account || {}
    return { account_id: id || contact?.id, token: ctx.token.value };
  })
});
