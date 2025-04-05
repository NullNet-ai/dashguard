'use server'
import { EEventType } from '../events/types';
import {  accountInvite } from './account/accountInvite';

type EventHandler = (eventName: string, args: any) => Promise<void>;

const actions: Record<EEventType, EventHandler> = {
  [EEventType.ACCOUNT_INVITE]: accountInvite
};

interface EventResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export const handleEvent = async (
  eventName: EEventType,
  args: unknown[],
): Promise<EventResult> => {
  const eventAction = actions[eventName];

  if (!eventAction) {
    return {
      success: false,
      message: `No handler found for event: ${eventName}`,
    };
  }

  try {
    await eventAction?.(eventName, args);
    return {
      success: true,
      message: `Successfully handled event: ${eventName}`,
    };
  } catch (error) {
    console.error(`Error handling event ${eventName}:`, error);
    return {
      success: false,
      message: `Failed to handle event: ${eventName}`,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
