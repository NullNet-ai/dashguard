'use server';

import { EEventType } from '~/server/events/types';
import { handleEvent } from '..';


export const triggerEvent = async (eventName: EEventType, args: unknown[]) => {
  return handleEvent(eventName, args);
};