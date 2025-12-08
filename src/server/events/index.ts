import type { EEventType, IEventConfig } from './types';
import RESET_PASSWORD from './account/RESET_PASSWORD';
import ACCOUNT_INVITE_INTERNAL from './account/ACCOUNT_INVITE_INTERNAL';
import ACCOUNT_INVITE_EXTERNAL from './account/ACCOUNT_INVITE_EXTERNAL';
import { createHash } from 'crypto';
import { getCachedData, setCacheData } from './utils/redisActions';

// Event Configurations
export const events: IEventConfig[] = [
  ACCOUNT_INVITE_INTERNAL,
  ACCOUNT_INVITE_EXTERNAL,
  RESET_PASSWORD,
];

// Event Handler
export const handleEvent = async (eventName: EEventType, args: Record<string, unknown>,) => {
  const eventAction = events.find((event) => event.type === eventName)?.handler;

  if (!eventAction) {
    return {
      success: false,
      message: `No handler found for event: ${eventName}`,
    };
  }
  const argsHash = createHash('md5').update(JSON.stringify(args)).digest('hex');
  const debounceKey = `debounce:${eventName}:${argsHash}`;
  try {
    console.info("🚀 ~ handleEvent ~ debounceKey:", debounceKey)
    const existingRecord = await getCachedData(debounceKey);
    if (existingRecord && existingRecord !== '0') {
      // Event is debounced, return without executing
      return {
        success: true,
        message: `Successfully handled event: ${eventName}`,
        debounced: true,
        ...(existingRecord?.response ?? {}),
      };
    }

    const response = await eventAction?.(eventName, args);
    await setCacheData(
      debounceKey,
      {
        eventName,
        timestamp: new Date().toISOString(),
        triggered: true,
        response,
      },
      5,
    );
    if (response?.redirectTo) {
      // router.push(response?.redirectTo);
    }
    return {
      success: true,
      message: `Successfully handled event: ${eventName}`,
      ...(response ?? {}),
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

// Helper function to get event configuration
export const getEventConfig = (type: EEventType): IEventConfig | undefined => {
  return events.find((event) => event.type === type);
};

// helper function to get event types
export const getEventTypes = (): EEventType[] => {
  return events.map((event) => event.type);
};
