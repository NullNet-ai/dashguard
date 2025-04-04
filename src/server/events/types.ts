// Event Types
export enum EEventType {
  ACCOUNT_INVITE = 'ACCOUNT_INVITE',
}

export interface IEventConfig {
  type: EEventType;
  payload: Record<string, unknown>;
}
