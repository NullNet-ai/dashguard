import { EEventType, type IEventConfig } from '../types';
import { eventHandler } from '../handlers/accountInvite';

const ACCOUNT_INVITE = {
  type: EEventType.ACCOUNT_INVITE,
  handler: eventHandler,
} as IEventConfig;

export default ACCOUNT_INVITE;
