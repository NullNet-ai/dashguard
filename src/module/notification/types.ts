export type NotificationActionType = {
  label: string;
  control: 'button' | 'link' | 'input';
  value: string;
  className?: string;
};

export type TNotificationSchema = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  link: string;
  categories: Array<String>;
  actions: NotificationActionType[];
  contact_id: string;
  acknowledged: boolean;
  metadata: string; // JSON string
};
