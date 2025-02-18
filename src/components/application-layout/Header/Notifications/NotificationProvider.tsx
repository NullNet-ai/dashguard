'use client'

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import {
  getNotifications,
  getNotificationsCountByContact,
  updateReadStatus,
  updatePinnedNotification,
  handlePopulateData,
  updateBatchRead,
  changeNotificationStatus,
} from './actions'
import type { IActions, INotificationSchema, INotificationContext } from './types'

const NotificationContext = createContext<INotificationContext | undefined>(
  undefined
)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotificationSchema[]>([])
  const [notificationCount, setNotificationCount] = useState<number>(0)
  const [showRead, setShowRead] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [type, setType] = useState<'all' | 'system' | 'social' | 'archive'>('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [selectedSort, setSelectedSort] = useState<string>('timestamp')
  const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>('desc')
  /**
   * Fetch notifications dynamically with filters, sorting, and ordering.
   */
  const fetchNotifications = useCallback(
    async ({
      type,
      order = {
        sortBy: selectedSort,
        sortOrder: selectedOrder,
      },
      showRead: showReadValue = showRead,
    }: {
      type?: 'all' | 'system' | 'social' | 'archive'
      order?: {
        sortBy: string
        sortOrder: 'asc' | 'desc'
      }
      filters?: any[]
      showRead?: boolean
    }) => {
      try {
        setLoading(true)

        const additionalFilters = []

        switch (type) {
          case 'all':
            additionalFilters.push({
              type: 'criteria',
              field: 'status',
              operator: 'equal',
              values: ['Active'],
            })
            break
          case 'system':
            additionalFilters.push({
              type: 'criteria',
              field: 'status',
              operator: 'equal',
              values: ['Active'],
            })
            additionalFilters.push({
              operator: 'and',
              type: 'operator',
              default: true,
            })
            additionalFilters.push({
              type: 'criteria',
              field: 'categories',
              operator: 'contains',
              values: ['System'],
            })
            break
          case 'social':
            additionalFilters.push({
              type: 'criteria',
              field: 'status',
              operator: 'equal',
              values: ['Active'],
            })
            additionalFilters.push({
              operator: 'and',
              type: 'operator',
              default: true,
            })
            additionalFilters.push({
              type: 'criteria',
              field: 'categories',
              operator: 'contains',
              values: ['Social'],
            })
            break
          case 'archive':
            additionalFilters.push({
              type: 'criteria',
              field: 'status',
              operator: 'equal',
              values: ['Archived'],
            })
            break
        }

        if (additionalFilters.length > 0 && !showReadValue) {
          additionalFilters.push({
            operator: 'and',
            type: 'operator',
            default: true,
          })
          additionalFilters.push({
            type: 'criteria',
            field: 'notification_status',
            operator: 'equal',
            values: ['unread'],
          })
        }

        const data = await getNotifications({
          filters: additionalFilters,
          order,
        })

        setNotifications(data as INotificationSchema[])

        const count = await getNotificationsCountByContact()
        setNotificationCount(count as number)
      }
      catch (error) {
        console.error('❌ Failed to fetch notifications:', error)
      }
      finally {
        setLoading(false)
      }
    }, [showRead]
  )

  /**
   * Toggle between showing all notifications and only unread ones.
   */
  const toggleUnread = async () => {
    const newShowRead = !showRead
    setShowRead(newShowRead)
    await fetchNotifications({
      type,
      showRead: newShowRead,
    })
  }

  /**
   * Mark a single notification as read/unread.
   */
  const handleSingleReadUnread = useCallback(
    async ({
      id,
      notification_status,
    }: {
      id: string
      notification_status: 'read' | 'unread'
    }) => {
      try {
        // Optimistic Updates.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        updateReadStatus({
          id,
          notification_status,
        })

        setNotifications(prev => prev.map(notification => notification.id === id
          ? { ...notification, notification_status: notification.notification_status === 'unread' ? 'read' : 'unread' }
          : notification
        )
        )
        setNotificationCount((prev) => {
          if (notification_status === 'read') {
            return prev - 1
          }
          else {
            return prev + 1
          }
        })
      }
      catch (error) {
        console.error('❌ Failed to update notification:', error)
      }
    }, []
  )

  /**
   * Toggle the pinned status of a notification.
   */
  const handlePinNotification = useCallback(
    async ({
      id,
      is_pinned,
    }: {
      id: string
      is_pinned: boolean
    }) => {
      try {
        await updatePinnedNotification({
          id,
          is_pinned,
        })

        setNotifications(prev => prev.map(notification => notification.id === id ? { ...notification, is_pinned: !notification.is_pinned } : notification
        )
        )
      }
      catch (error) {
        console.error('❌ Failed to update pinned notification:', error)
      }
    }, []
  )

  /**
   * Mark all unread notifications as read.
   */
  const handleBatchRead = useCallback(async () => {
    try {
      const unreadNotificationIds = notifications
        .filter(n => n.notification_status === 'unread')
        .map(n => n.id)

      // Optimistic updates
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      updateBatchRead({
        ids: unreadNotificationIds,
        notification_status: 'read',
      })

      setNotifications(prev => prev.map(notification => notification.notification_status === 'unread' ? { ...notification, notification_status: 'read' } : notification
      )
      )

      setNotificationCount(0)
    }
    catch (error) {
      console.error('❌ Failed to batch update notifications:', error)
    }
  }, [notifications])

  // to be deleted
  const handleInsert = async () => {
    await handlePopulateData()
  }

  const handleDropdownOpen = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSortChange = async (option: string) => {
    setSelectedSort(option)
    setIsDropdownOpen(false)
    await fetchNotifications({
      type,
      order: {
        sortBy: option,
        sortOrder: selectedOrder,
      },
    })
  }

  const handleSortOrderChange = async (order: string) => {
    setSelectedOrder(order as 'asc' | 'desc')
    setIsDropdownOpen(false)

    await fetchNotifications({
      type,
      order: {
        sortBy: selectedSort,
        sortOrder: order as 'asc' | 'desc',
      },
    })
  }

  const handleChangeType = async (type: string) => {
    setType(type as 'all' | 'system' | 'social' | 'archive')
    await fetchNotifications({ type: type as 'all' | 'system' | 'social' | 'archive' })
  }

  const handleArchiveNotification = async (id: string) => {
    await changeNotificationStatus({
      id,
      status: 'Archived',
    })

    setNotifications(prev => prev.filter(n => n.id !== id)
    )
  }

  const handleRestoreNotificationStatus = async (id: string) => {
    await changeNotificationStatus({
      id,
      status: 'Active',
    })
    setNotifications(prev => prev.filter(n => n.id !== id)
    )
  }

  const handleDeleteNotification = async (id: string) => {
    await changeNotificationStatus({
      id,
      status: 'Delete',
    })
    setNotifications(prev => prev.filter(n => n.id !== id)
    )
  }

  // Fetch notifications on mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchNotifications({ type })
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData()
  }, [])

  const actions: IActions = {
    fetchNotifications,
    toggleUnread,
    handleSingleReadUnread,
    handlePinNotification,
    handleBatchRead,
    handleDropdownOpen,
    handleSortChange,
    handleSortOrderChange,
    handleChangeType,
    handleInsert,
    handleArchiveNotification,
    handleRestoreNotificationStatus,
    handleDeleteNotification,
  }

  return (
    <NotificationContext.Provider
      value={{
        state: {
          notifications,
          notificationCount,
          showRead,
          loading,
          isDropdownOpen,
          selectedSort,
          selectedOrder,
        },
        actions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
