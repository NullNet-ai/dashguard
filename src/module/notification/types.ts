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
  category?: string[]; // Optional categories
  icon?: string; // Optional icon URL
  source?: string; // Optional source
  is_pinned?: boolean; // New: Flag to indicate if the notification is pinned
  actions?: NotificationActionType[]; // Actions are optional
  recipient_id?: string; // Supports multiple recipients (UUIDs)
  notification_status: 'unread' | 'read' | 'dismissed'; // Enum type for status
  priority_label: 'low' | 'medium' | 'high'; // Enum type for priority
  priority_level: number
  expiry_date?: string; // Optional expiration timestamp
  status: string;
  metadata?: Record<string, any>; // Structured JSON data instead of just a string
};
