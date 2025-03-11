import { TMethod } from '../utils/createSchedule'
import { EEventType } from './types'

// Event Configuration Interface
export interface IEventConfig {
  type: EEventType
  callback_url: string
  method: TMethod
  description: string
}

// Event Configurations
export const events: IEventConfig[] = [
  {
    type: EEventType.INVITATION_EXPIRE,
    callback_url: '/api/account/invitation-expire',
    method: 'POST',
    description: 'Handles invitation expiration and account status updates',
  },
  {
    type: EEventType.ACCOUNT_DEACTIVATE,
    callback_url: '/api/account/deactivate',
    method: 'POST',
    description: 'Handles account deactivation after specified period',
  },
  {
    type: EEventType.LICENSE_EXPIRE,
    callback_url: '/api/license/expire',
    method: 'POST',
    description: 'Handles license expiration and related actions',
  },
  {
    type: EEventType.ACCOUNT_INVITE,
    callback_url: '/api/account/invite',
    method: 'POST',
    description: 'Handles account invitation and related actions',
  },
]

// Helper function to get event configuration
export const getEventConfig = (type: EEventType): IEventConfig | undefined => {
  return events.find(event => event.type === type)
}

// helper function to get event types
export const getEventTypes = (): EEventType[] => {
  return events.map(event => event.type)
}