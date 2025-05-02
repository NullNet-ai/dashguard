import { EEventType, type IEventConfig } from '../types';
import { eventHandler } from '../handlers/accountInvite';

const ACCOUNT_INVITE_INTERNAL = {
  type: EEventType.ACCOUNT_INVITE_INTERNAL,
  handler: eventHandler,
} as IEventConfig;

export default ACCOUNT_INVITE_INTERNAL;
