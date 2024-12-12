import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { gridRouter } from "./routers/grid";
import { wizardRouter } from "./routers/wizard";
import { authRouter } from "./routers/auth";
import { tabRouter } from "./routers/tab";
import { menuRouter } from "./routers/menu";
import { recordRouter } from "./routers/record";
import { userRolesRouter } from "./routers/user_role";
import { fileRouter } from "./routers/file";
import { googleRouter } from "./routers/google";
import { positionRoleRouter } from "./routers/position_role";
import { reportsRouter } from "./routers/report";
import { reportFiltersRouter } from "./routers/report_filter";
import { notificationsRouter } from "./routers/notification";
import { degreeLevelRouter } from "./routers/degree_level";
import { contactRouter } from "./routers/contact";
import { contactEmailRouter } from "./routers/contact_email";
import { contactPhoneNumberRouter } from "./routers/contact_phone_number";
import { cityRouter } from "./routers/city";
import { countryRouter } from "./routers/country";
import { validatorRouter } from "./routers/validator";
import { contactLinkRouter } from "./routers/contact_link";
import { positionTypeRouter } from "./routers/position_type";
import { benefitRouter } from "./routers/benefit";
import { contactOrganizationsRouter } from "./routers/contact_organizations";
import { contactSubOrganizationRouter } from "./routers/contact_sub_organizations";
import { organizationRouter } from "./routers/organization";
import { employmentTypeRouter } from "./routers/employment_type";
import { payPeriodRouter } from "./routers/pay_period";
import { remindersRouter } from "./routers/reminder";
import { requirementTypeRouter } from "./routers/requirement_type";
import { workSetupRouter } from "./routers/work_setups";
import { timezonesRouter } from "./routers/timezone";
import { bookingsRouter } from "./routers/booking";
import { bookingParticipantsRouter } from "./routers/booking_participant";
import { candidatesRouter } from "./routers/candidates";
import { positionsRouter } from "./routers/position";
import { positionBenefitsRouter } from "./routers/position_benefit";
import { positionPostingsRouter } from "./routers/position_posting";
import { positionRequirementsRouter } from "./routers/position_requirements";
import { positionWorkSetupsRouter } from "./routers/position_work_setup";
import { educationRouter } from "./routers/education";
import { accountInformationRouter } from "./routers/account_information";
import { contactCertificateRouter } from "./routers/contact_certificate";
import { contactSkillRouter } from "./routers/contact_skill";
import { contactFileRouter } from "./routers/contact_file";

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
  file: fileRouter,
  google: googleRouter,
  positionRole: positionRoleRouter,
  report: reportsRouter,
  reportFilter: reportFiltersRouter,
  notification: notificationsRouter,
  degreeLevel: degreeLevelRouter,
  contact: contactRouter,
  contactEmail: contactEmailRouter,
  contactPhoneNumber: contactPhoneNumberRouter,
  city: cityRouter,
  country: countryRouter,
  validator: validatorRouter,
  contactLink: contactLinkRouter,
  positionType: positionTypeRouter,
  benefit: benefitRouter,
  contactOrganization: contactOrganizationsRouter,
  contactSubOrganization: contactSubOrganizationRouter,
  organization: organizationRouter,
  employmentType: employmentTypeRouter,
  payPeriod: payPeriodRouter,
  reminder: remindersRouter,
  requirementType: requirementTypeRouter,
  workSetups: workSetupRouter,
  timezones: timezonesRouter,
  booking: bookingsRouter,
  bookingParticipant: bookingParticipantsRouter,
  candidate: candidatesRouter,
  position: positionsRouter,
  positionBenefit: positionBenefitsRouter,
  positionPosting: positionPostingsRouter,
  positionRequirement: positionRequirementsRouter,
  positionWorkSetup: positionWorkSetupsRouter,
  education: educationRouter,
  accountInformation: accountInformationRouter,
  contactCertificate: contactCertificateRouter,
  contactSkill: contactSkillRouter,
  contactFile: contactFileRouter,
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
