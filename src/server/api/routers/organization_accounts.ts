// import z from "zod";
import {
  createTRPCRouter,
  // privateProcedure
} from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
const entity = "organization_accounts";
export const organizationAccountsRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
});
