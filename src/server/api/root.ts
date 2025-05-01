import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'

import { authRouter } from './routers/auth'
import { deviceAliasRouter } from './routers/configuration_alias'
import { deviceRuleRouter } from './routers/configuration_rule'
import { contactRouter } from './routers/contact'
import { countryRouter } from './routers/country'
import { dashboardRouter } from './routers/dashboard'
import { degreeLevelRouter } from './routers/degree_level'
import { deviceRouter } from './routers/device'
import { deviceConfigurationRouter } from './routers/device_configuration'
import { deviceGroupSettingsRouter } from './routers/device_group_settings'
import { deviceHeartbeatsRouter } from './routers/device_heartbeats'
import { filesRouter } from './routers/files'
import { formRouter } from './routers/form'
import { googleRouter } from './routers/google'
import { gridRouter } from './routers/grid'
import { menuRouter } from './routers/menu'
import { notificationsRouter } from './routers/notification'
import { organizationRouter } from './routers/organization'
import { organizationContactsRouter } from './routers/organization_contact'
import { packetRouter } from './routers/packet'
import { recordRouter } from './routers/record'
import { tabRouter } from './routers/tab'
import { cachedFilterRouter } from './routers/timeline_filter'
import { userRolesRouter } from './routers/user_role'
import { validatorRouter } from './routers/validator'
import { wizardRouter } from './routers/wizard'
import { organizationAccountRouter } from './routers/organization_account';
import { deviceRemoteAccessSessionRouter } from './routers/device_remote_access_session'
import { gridFilterRouter } from './routers/grid_filter'
import { resolutionsRouter } from './routers/resolutions'

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
  deviceRule: deviceRuleRouter,
  deviceAlias: deviceAliasRouter,
  deviceConfiguration: deviceConfigurationRouter,
  deviceHeartbeats: deviceHeartbeatsRouter,
  packet: packetRouter,
  cachedFilter: cachedFilterRouter,
  organizationAccount: organizationAccountRouter,
  deviceRemoteAccessSession: deviceRemoteAccessSessionRouter,
  gridFilter: gridFilterRouter,
  resolution: resolutionsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
