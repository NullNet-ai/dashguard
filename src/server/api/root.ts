import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { gridRouter } from "./routers/grid";
import { wizardRouter } from "./routers/wizard";
import { authRouter } from "./routers/auth";
import { tabRouter } from "./routers/tab";
import { menuRouter } from "./routers/menu";
import { recordRouter } from "./routers/record";
import { userRolesRouter } from "./routers/user_role";
import { notificationsRouter } from "./routers/notification";
import { validatorRouter } from "./routers/validator";
import { degreeLevelRouter } from "./routers/degree_level";
import { countryRouter } from "./routers/country";
import { googleRouter } from "./routers/google";
import { contactRouter } from "./routers/contact";
import { organizationRouter } from "./routers/organization";
import { dashboardRouter } from "./routers/dashboard";
import { organizationContactsRouter } from "./routers/organization_contact";
import { filesRouter } from "./routers/files";
import { formRouter } from "./routers/form";
import { deviceRouter } from "./routers/device";
import { deviceGroupSettingsRouter } from "./routers/device_group_settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  grid: gridRouter,
  wizard: wizardRouter,
  user_role: userRolesRouter,
  tab: tabRouter,
  menu: menuRouter,
  record: recordRouter,
  notification: notificationsRouter,
  contact: contactRouter,
  validator: validatorRouter,
  degreeLevel: degreeLevelRouter,
  country: countryRouter,
  google: googleRouter,
  organization: organizationRouter,
  organizationContact: organizationContactsRouter,
  files: filesRouter,
  form: formRouter,
  device: deviceRouter,
  deviceGroupSettings: deviceGroupSettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
