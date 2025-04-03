import { EEventType, type IEventConfig } from '../types'

const ACCOUNT_DEACTIVATE = {
  type: EEventType.ACCOUNT_DEACTIVATE,
  callback_url: '/api/account/deactivate',
  method: 'POST',
  description: 'Handles account deactivation after specified period',
} as IEventConfig

export default ACCOUNT_DEACTIVATE
