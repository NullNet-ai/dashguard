import { EEventType, type IEventConfig } from '../types';

 const ACCOUNT_INVITE = {
    type: EEventType.ACCOUNT_INVITE,
    callback_url: '/api/account/invite',
    method: 'POST',
    description: 'Handles account invitation and related actions',
} as IEventConfig

export default ACCOUNT_INVITE;