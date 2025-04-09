import { eventHandler } from '../handlers/resetPassword'
import { EEventType, type IEventConfig } from '../types'

const RESET_PASSWORD = {
  type: EEventType.RESET_PASSWORD,
  handler: eventHandler,
} as IEventConfig

export default RESET_PASSWORD
