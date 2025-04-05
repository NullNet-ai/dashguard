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
    
    console.log('%c Line:13 🌭', 'color:#4fff4B',  ctx.session.account);
    const { contact } = ctx.session.account || {}
    return contact?.id
  })
});
