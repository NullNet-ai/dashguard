'use server'
import { api } from '~/trpc/server'

export const getNotificationsCountByContact = async () : Promise<number>  => {
  const count = await api.notification.getNotificationsCountByContact()
  return count || 0
}

export const getNotifications = async ({
  isLoadMore = false,
  filters = [],
  order = {
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit: 50,
    starts_at: 0,
  },
}: {
  isLoadMore?: boolean
  filters?: any[]
  order?: { 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
    limit: number,
    starts_at: number,
  }
}) : Promise<Record<string,any>> => {


  const { data : notifications, total_count} = await api.notification.getNotifications({
    filters,
    order,
  })

  return {
    data : notifications,
    total_count
  }
}

export const updateReadStatus = async ({
  id,
  notification_status,
}: {
  id: string
  notification_status: 'read' | 'unread'
}) => {
  const update_notification = await api.notification.handleSingleReadUnread({
    id,
    notification_status,
  })

  return update_notification
}

export const updateBatchRead = async ({
  ids,
  notification_status,
}: {
  ids: string[]
  notification_status: 'read' | 'unread'
}) => {
  await api.notification.handleBatchRead({
    ids,
    notification_status,
  })
}

export const updatePinnedNotification = async ({
  id,
  is_pinned,
}: {
  id: string
  is_pinned: boolean
}) => {
  const update_notification = await api.notification.handlePinNotification({
    id,
    is_pinned,
  })

  return update_notification
}

export const changeNotificationStatus = async ({
  id,
  status,
}: {
  id: string
  status: string
}) => {
  const update_notification = await api.notification.handleChangeStatus({
    id,
    status,
  })

  return update_notification
}

export const handlePopulateData = async () => {
  const populate = await api.notification.populateDatabase()

  return populate
}
