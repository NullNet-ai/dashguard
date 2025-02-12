export enum controlEnum {
  button = 'button',
  link = 'link',
  input = 'input',
  toggle = 'toggle',
  dropdown = 'dropdown',
}

export type NotificationActionType = {
  label: string;
  control: controlEnum;
  value?: string; // Optional since some actions may not need a value
  className?: string;
};

export type TNotificationSchema = {
  id: string; // ulid format
  title: string;
  description: string;
  timestamp: string; // Changed from string to Date object for proper handling
  link?: string; // Optional URL
  categories?: string[]; // Optional categories
  actions?: NotificationActionType[]; // Actions are optional
  recipients: string[]; // Supports multiple recipients (UUIDs)
  status: 'unread' | 'read' | 'dismissed'; // Enum type for status
  priority: 'low' | 'medium' | 'high'; // Enum type for priority
  expires_at?: string; // Optional expiration timestamp
  is_acknowledged: boolean;
  metadata?: Record<string, any>; // Structured JSON data instead of just a string
};
