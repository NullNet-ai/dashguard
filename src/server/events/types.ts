import { TMethod } from '../../lib/createSchedule'

// Event Types
export enum EEventType {
    INVITATION_EXPIRE = 'INVITATION_EXPIRE',
    ACCOUNT_DEACTIVATE = 'ACCOUNT_DEACTIVATE',
    LICENSE_EXPIRE = 'LICENSE_EXPIRE',
    ACCOUNT_INVITE = 'ACCOUNT_INVITE',
  }

  export interface IEventConfig {
    type: EEventType
    callback_url: string
    method: TMethod
    description: string
  }