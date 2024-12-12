import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { gridRouter } from "./routers/grid";
import { wizardRouter } from "./routers/wizard";
import { authRouter } from "./routers/auth";
import { tabRouter } from "./routers/tab";
import { menuRouter } from "./routers/menu";
import { recordRouter } from "./routers/record";
import { userRolesRouter } from "./routers/user_role";
import { notificationsRouter } from "./routers/notification";
import { contactEmailRouter } from "./routers/contact_email";
import { contactPhoneNumberRouter } from "./routers/contact_phone_number";
import { validatorRouter } from "./routers/validator";
import { contactLinkRouter } from "./routers/contact_link";
import { contactOrganizationsRouter } from "./routers/contact_organizations";
import { contactSubOrganizationRouter } from "./routers/contact_sub_organizations";
import { organizationRouter } from "./routers/organization";
import { contactCertificateRouter } from "./routers/contact_certificate";
import { contactSkillRouter } from "./routers/contact_skill";
import { contactFileRouter } from "./routers/contact_file";
import { accountInformationRouter } from "./routers/account_information";
import { educationRouter } from "./routers/education";
import { degreeLevelRouter } from "./routers/degree_level";
import { countryRouter } from "./routers/country";
import { googleRouter } from "./routers/google";
import { contactRouter } from "./routers/contact";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  grid: gridRouter,
  wizard: wizardRouter,
  user_role: userRolesRouter,
  tab: tabRouter,
  menu: menuRouter,
  record: recordRouter,
  notification: notificationsRouter,
  contact: contactRouter,
  contactEmail: contactEmailRouter,
  contactPhoneNumber: contactPhoneNumberRouter,
  validator: validatorRouter,
  contactLink: contactLinkRouter,
  contactOrganization: contactOrganizationsRouter,
  contactSubOrganization: contactSubOrganizationRouter,
  organization: organizationRouter,
  contactCertificate: contactCertificateRouter,
  contactSkill: contactSkillRouter,
  contactFile: contactFileRouter,
  accountInformation: accountInformationRouter,
  education: educationRouter,
  degreeLevel: degreeLevelRouter,
  country: countryRouter,
  google: googleRouter,
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
