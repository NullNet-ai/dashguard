// import z from "zod";
import {
  createTRPCRouter,
  // privateProcedure
} from "~/server/api/trpc";
import { createDefineRoutes } from "../baseCrud";
const entity = "";
export const templateRouter = createTRPCRouter({
  ...createDefineRoutes(entity),
});
