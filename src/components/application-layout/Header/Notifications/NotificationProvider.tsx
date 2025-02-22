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
import type {
  IActions,
  INotificationSchema,
  INotificationContext,
  TNotificationType,
} from './types'
import { buildNotificationFilters } from './utils/buildNotificationFilters'

const NotificationContext = createContext<INotificationContext | undefined>(
  undefined,
)

const PAGE_SIZE = 10

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<INotificationSchema[]>([]);
  const [totalNotificationCount, setTotalNotificationCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showRead, setShowRead] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [type, setType] = useState<TNotificationType>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('timestamp');
  const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>('desc');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState<number>(1);

  const [buffer, setBuffer] = useState<INotificationSchema[]>([]);

  const [loadingPopulateData, setLoadingPopulateData] =
    useState<boolean>(false);
  const [loadingMarkAllAsRead, setLoadingMarkAllAsRead] =
    useState<boolean>(false);

  /**
   * Fetch notifications dynamically with filters, sorting, and ordering.
   */
  const fetchNotifications = useCallback(
    async ({
      type,
      order = {
        sortBy: selectedSort,
        sortOrder: selectedOrder,
        limit: 10,
        starts_at: 0,
      },
      showRead: showReadValue = showRead,
      isLoadMore = false,
    }: {
      type?: TNotificationType
      order?: {
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
        limit?: number
        starts_at?: number
      }
      showRead?: boolean
      page?: number
      isLoadMore?: boolean
    }) => {
      try {
        if (!type) return [];

        const additionalFilters = buildNotificationFilters({
          type,
          showRead: showReadValue,
        });

        const { data, total_count } = await getNotifications({
          isLoadMore,
          filters: additionalFilters,
          order: {
            sortBy: order.sortBy || selectedOrder,
            sortOrder: order.sortOrder || selectedOrder,
            limit: isLoadMore ? PAGE_SIZE : PAGE_SIZE * 3,
            starts_at: isLoadMore ? (page + 2) * PAGE_SIZE : 0,
          },
        })

        if (isLoadMore) {
          setBuffer((prev) => [...prev, ...data]);
          setPage((prev) => prev + 1);
        } else {
          setNotifications(data.slice(0, PAGE_SIZE));
          setBuffer(data.slice(PAGE_SIZE));
          setPage(1);
          setHasMore(data.slice(0, PAGE_SIZE).length < total_count);
          setNotificationCount(total_count);
        }
      } catch (error) {
        console.error('❌ Failed to fetch notifications:', error);
      }
      finally {
        setLoading(false)
      }
    }, [showRead, page, notifications.length],
  )

  const fetchMoreNotifications = useCallback(async () => {
    if (!hasMore || loading) return

    setNotifications((prev) => [...prev, ...buffer.slice(0, PAGE_SIZE)]);
    setHasMore(
      [...notifications, ...buffer.slice(0, PAGE_SIZE)].length <
        notificationCount,
    );
    setBuffer((prev) => prev.slice(PAGE_SIZE));
    await fetchNotifications({
      type,
      isLoadMore: true,
      showRead: showRead,
      order: {
        sortBy: selectedSort,
        sortOrder: selectedOrder,
      },
    });

  }, [type, hasMore, loading, fetchNotifications, buffer]);

  /**
   * Toggle between showing all notifications and only unread ones.
   */
  const toggleUnread = async () => {
    setLoading(true);
    const newShowRead = !showRead;
    await fetchNotifications({
      type,
      showRead: newShowRead,
    });
    setShowRead(newShowRead);
    setLoading(false);
  };

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
          ? {
              ...notification,
              notification_status:
                    notification.notification_status === 'unread'
                      ? 'read'
                      : 'unread',
            }
          : notification,
        ),
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
    }, [],
  )

  /**
   * Toggle the pinned status of a notification.
   */
  const handlePinNotification = useCallback(
    async ({
      id,
      is_pinned,
      type,
    }: {
      id: string;
      is_pinned: boolean;
      type: TNotificationType;
    }) => {
      try {
        updatePinnedNotification({
          id,
          is_pinned,
        })

        if (type === 'pinned' && !is_pinned) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          return;
        }
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_pinned: !notification.is_pinned }
              : notification,
          ),
        );
      } catch (error) {
        console.error('❌ Failed to update pinned notification:', error);
      }
    }, [],
  )

  /**
   * Mark all unread notifications as read.
   */
  const handleBatchRead = useCallback(async () => {
    try {
      const unreadNotificationIds = notifications
        .filter(n => n.notification_status === 'unread')
        .map(n => n.id)

      setLoadingMarkAllAsRead(true);
      await updateBatchRead({
        ids: unreadNotificationIds,
        notification_status: 'read',
      })

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification_status === 'unread'
            ? { ...notification, notification_status: 'read' }
            : notification,
        ),
      );
      setLoadingMarkAllAsRead(false);
      setNotificationCount((prev) => prev - unreadNotificationIds.length);
    } catch (error) {
      console.error('❌ Failed to batch update notifications:', error);
    }
  }, [notifications])

  // to be deleted
  const handleInsert = async () => {
    setLoadingPopulateData(true);
    await handlePopulateData();
    setLoadingPopulateData(false);
  };

  const handleDropdownOpen = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSortChange = async (option: string) => {
    setLoading(true)
    setSelectedSort(option);
    setIsDropdownOpen(false);
    setPage(1); // Reset page
    await fetchNotifications({
      type,
      order: {
        sortBy: option,
        sortOrder: selectedOrder,
      },
    });
    setLoading(false)
  };

  const handleSortOrderChange = async (order: string) => {
    setLoading(true)
    setSelectedOrder(order as 'asc' | 'desc');
    setIsDropdownOpen(false);
    setPage(1); // Reset page
    await fetchNotifications({
      type,
      order: {
        sortBy: selectedSort,
        sortOrder: order as 'asc' | 'desc',
      },
    });
    setLoading(false)
  };

  const handleChangeType = async (type: TNotificationType) => {
    setLoading(true);

    setType(type);
    setPage(1); // Reset page
    setNotifications([]);
    setSelectedSort('timestamp');
    setSelectedOrder('desc');
    await fetchNotifications({ type: type as TNotificationType, order : {
      sortBy: 'timestamp',
      sortOrder: 'desc',
    } });

    setLoading(false)
  };

  const handleArchiveNotification = async (
    notification: INotificationSchema,
  ) => {
    changeNotificationStatus({
      id: notification.id,
      status: 'Archived',
    })

    if (notification.notification_status === 'unread') {
      setNotificationCount((prev) => prev - 1);
    }

    setNotifications(prev => prev.filter(n => n.id !== notification.id))
  }

  const handleRestoreNotificationStatus = async (id: string) => {
    await changeNotificationStatus({
      id,
      status: 'Active',
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleDeleteNotification = async (id: string) => {
    await changeNotificationStatus({
      id,
      status: 'Delete',
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotificationCount = async () => {
      await getNotificationsCountByContact()
        .then(({
          allUnreadNotificationCount,
          allNotificationCount,
        }) => {
          setNotificationCount(allUnreadNotificationCount as number);
          setTotalNotificationCount(allNotificationCount as number);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch notifications:', error);
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchNotificationCount();
  }, []);

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
    fetchMoreNotifications,
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
          totalNotificationCount,
          hasMore,
          loadingPopulateData,
          loadingMarkAllAsRead,
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
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    )
  }
  return context
}
