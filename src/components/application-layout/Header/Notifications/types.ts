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
    type,
  }: {
    id: string
    is_pinned: boolean
    type: TNotificationType
  }) => void
  handleBatchRead: () => void
  handleDropdownOpen: () => void
  handleSortChange: (option: string) => void
  handleSortOrderChange: (option: string) => void
  handleChangeType: (type: TNotificationType) => void
  handleInsert: () => void
  handleArchiveNotification: (notification: INotificationSchema) => void
  handleRestoreNotificationStatus: (id: string) => void
  handleDeleteNotification: (id: string) => void
  fetchMoreNotifications: () => void
}

export interface IState {
  notifications : INotificationSchema[],
  notificationCount : number,
  showRead : boolean,
  loading : boolean,
  isDropdownOpen : boolean,
  selectedSort : string,
  selectedOrder : string,
  totalNotificationCount : number,
  hasMore : boolean,
  loadingPopulateData : boolean,
  loadingMarkAllAsRead : boolean,
}
export interface INotificationContext {
  state: IState
  actions: IActions
}


export type TNotificationType = 'all' | 'pinned' | 'system' | 'social' | 'archive'