import { EEventType, type IEventConfig } from '../types'

const INVITATION_EXPIRE = {
  type: EEventType.INVITATION_EXPIRE,
  callback_url: '/api/account/invitation-expire',
  method: 'POST',
  description: 'Handles invitation expiration and account status updates',
} as IEventConfig

export default INVITATION_EXPIRE
