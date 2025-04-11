// Event Types
export enum EEventType {
  ACCOUNT_INVITE = 'ACCOUNT_INVITE',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export interface IEventConfig {
  type: EEventType;
  handler: (eventName: string, data: any) => Promise<any>;
}

export interface EventResult {
  success: boolean;
  message?: string;
  error?: Error;
}