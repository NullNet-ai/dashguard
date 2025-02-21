export enum controlEnum {
  button = 'button',
  link = 'link',
  input = 'input',
  toggle = 'toggle',
  dropdown = 'dropdown',
}

export interface NotificationActionType {
  label: string
  control: controlEnum
  value?: string
  className?: string
}

export interface TNotificationSchema {
  id: string
  title: string
  description: string
  timestamp: string
  link?: string
  category?: string[]
  icon?: string
  source?: string
  is_pinned?: boolean
  actions?: NotificationActionType[]
  recipient_id?: string
  notification_status: 'unread' | 'read' | 'dismissed'
  priority_label: 'low' | 'medium' | 'high'
  priority_level: number
  expiry_date?: string
  status: string
  metadata?: Record<string, any>
}
