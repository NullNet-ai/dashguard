import type { EEventType, EventResult, IEventConfig } from './types'
import RESET_PASSWORD from './account/RESET_PASSWORD'
import ACCOUNT_INVITE_INTERNAL from './account/ACCOUNT_INVITE_INTERNAL';
import ACCOUNT_INVITE_EXTERNAL from './account/ACCOUNT_INVITE_EXTERNAL';

// Event Configurations
export const events: IEventConfig[] = [
  ACCOUNT_INVITE_INTERNAL,
  ACCOUNT_INVITE_EXTERNAL,
  RESET_PASSWORD
]

// Event Handler
export const handleEvent = async (
  eventName: EEventType,
  args: unknown[],
): Promise<EventResult> => {
  const eventAction = events.find(event => event.type === eventName)?.handler

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

// Helper function to get event configuration
export const getEventConfig = (type: EEventType): IEventConfig | undefined => {
  return events.find(event => event.type === type)
}

// helper function to get event types
export const getEventTypes = (): EEventType[] => {
  return events.map(event => event.type)
}