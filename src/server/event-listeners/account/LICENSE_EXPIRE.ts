import { EEventType, type IEventConfig } from '../types';

 const LICENSE_EXPIRE = {
    type: EEventType.LICENSE_EXPIRE,
    callback_url: '/api/license/expire',
    method: 'POST',
    description: 'Handles license expiration and related actions',
} as IEventConfig

export default LICENSE_EXPIRE;