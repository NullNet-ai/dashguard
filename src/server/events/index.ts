import type { EEventType, IEventConfig } from './types'
import INVITATION_EXPIRE from './list/LICENSE_EXPIRE'
import LICENSE_EXPIRE from './list/LICENSE_EXPIRE'
import ACCOUNT_DEACTIVATE from './list/ACCOUNT_DEACTIVATE'
import ACCOUNT_INVITE from './list/ACCOUNT_INVITE'

// Event Configurations
export const events: IEventConfig[] = [
  INVITATION_EXPIRE,
  ACCOUNT_DEACTIVATE,
  LICENSE_EXPIRE,
  ACCOUNT_INVITE
]

// Helper function to get event configuration
export const getEventConfig = (type: EEventType): IEventConfig | undefined => {
  return events.find(event => event.type === type)
}

// helper function to get event types
export const getEventTypes = (): EEventType[] => {
  return events.map(event => event.type)
}