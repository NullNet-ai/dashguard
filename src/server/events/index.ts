import type { EEventType, IEventConfig } from './types'
import ACCOUNT_INVITE from './account/ACCOUNT_INVITE'

// Event Configurations
export const events: IEventConfig[] = [
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