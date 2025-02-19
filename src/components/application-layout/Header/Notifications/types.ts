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

export interface INotificationSchema {
  id: string
  title: string
  description: string
  timestamp: string
  link?: string
  categories?: string[]
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

export interface IActions {
  fetchNotifications: (data: Record<string, any>) => void
  toggleUnread: () => void
  handleSingleReadUnread: ({
    id,
    notification_status,
  }: {
    id: string
    notification_status: 'read' | 'unread'
  }) => void
  handlePinNotification: ({
    id,
    is_pinned,
  }: {
    id: string
    is_pinned: boolean
  }) => void
  handleBatchRead: () => void
  handleDropdownOpen: () => void
  handleSortChange: (option: string) => void
  handleSortOrderChange: (option: string) => void
  handleChangeType: (type: string) => void
  handleInsert: () => void
  handleArchiveNotification: (id: string) => void
  handleRestoreNotificationStatus: (id: string) => void
  handleDeleteNotification: (id: string) => void
  fetchMoreNotifications: () => void
}

export interface IState {
  notifications: INotificationSchema[]

}

export interface INotificationContext {
  state: any
  actions: IActions
}


export type TNotificationType = 'all' | 'system' | 'social' | 'archive'