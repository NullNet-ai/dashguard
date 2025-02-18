'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { BellDot, EllipsisVertical, Mail, MailOpen, Pin } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '~/components/ui/button'

import { useNotifications } from '../NotificationProvider'
import { type INotificationSchema } from '../types'

import EmptyNotification from './EmptyNotification'

const NotificationItem = ({ type }: { type: string }) => {
  const { state, actions } = useNotifications()
  const { notifications } = state

  useEffect(() => {
    actions.handleChangeType(type)
  }, [])

  if (!notifications?.length) {
    return <EmptyNotification />
  }

  // Function to format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)

    // If less than 24 hours, show relative time
    if (diffHour < 24) {
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
    }

    // Otherwise, format as "Wed 02-15"
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
      .replace(',', '')
  }

  const handleOpenNewTab = (link: string) => {
    window.open(link, '_blank')
  }

  return (
    <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100flex h-[70vh] min-h-80 flex-col gap-2 overflow-y-auto'>
      {notifications.map((notification: INotificationSchema) => (
        <div
          className={`relative flex flex-col gap-2 rounded-lg border ${
            notification.notification_status === 'read'
              ? 'border-gray-200 bg-gray-50'
              : 'border-blue-100 bg-blue-50'
          } p-3 shadow-sm hover:bg-gray-100 transition-colors duration-200`}
          key={notification.id}
        >
          {/* Title & Priority */}
          <div className='flex items-start justify-between'>
            {/* icon */}
            {/* Icon & Title */}
            <div className='flex items-center gap-2'>
              {notification.icon
                ? (
                    <BellDot className='h-5 w-5 text-gray-500' />
                  )
                : (
                    <Mail className='h-5 w-5 text-gray-500' />
                  )}
              <h4
                className="text-sm font-semibold hover:underline"
                onClick={() => notification.link && handleOpenNewTab(notification.link)}
                aria-hidden="true"
              >
                {notification.title}
              </h4>
            </div>

            <div className='flex items-center gap-2'>
              {/* Read / Unread Icon */}
              {notification.notification_status === 'read'
                ? (
                    <MailOpen
                      className='h-4 w-4 text-gray-300'
                      onClick={() => actions?.handleSingleReadUnread({
                        id: notification.id,
                        notification_status: 'unread',
                      })}
                    />
                  )
                : (
                    <Mail
                      className='h-4 w-4 text-gray-300'
                      onClick={() => actions?.handleSingleReadUnread({
                        id: notification.id,
                        notification_status: 'read',
                      })}
                    />
                  )}
              {/* Pin Icon */}
              <Pin
                className={`h-4 w-4 ${notification.is_pinned ? 'fill-yellow-300 text-yellow-500' : 'text-gray-300'}`}
                onClick={() => actions?.handlePinNotification({
                  id: notification.id,
                  is_pinned: !notification.is_pinned,
                })}
              />
              {/* Priority Badge */}
              <span
                className={`rounded px-2 py-1 text-xs font-bold ${
                  notification.priority_level === 2
                    ? 'bg-red-100 text-red-600'
                    : notification.priority_level === 1
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {notification.priority_label.toUpperCase()}
              </span>
              {/* Dropdown Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild={true}>
                  <EllipsisVertical className='h-4 w-4 cursor-pointer text-gray-500' />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80'
                >
                  {type === 'archive'
                    ? (
                        <>
                          <DropdownMenuItem
                            className='relative flex cursor-pointer select-none items-center rounded-sm
                        px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900'
                            onClick={() => actions?.handleRestoreNotificationStatus(notification.id)}
                          >
                            <p>Restore</p>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
                        text-red-600 outline-none transition-colors hover:bg-red-50'
                            onClick={() => actions?.handleDeleteNotification(notification.id)}
                          >
                            <p>Delete</p>
                          </DropdownMenuItem>
                        </>
                      )
                    : (
                        <DropdownMenuItem
                          className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
                      outline-none transition-colors hover:bg-gray-100 hover:text-gray-900'
                          onClick={() => actions?.handleArchiveNotification(notification.id)}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          <p className='text-sm text-gray-500'>{notification.description}</p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className='mt-2 flex gap-2'>
              {notification.actions.map((action, index) => (
                <Button className={action.className} key={index} size="sm">
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          {/* Metadata */}
          <div className='flex items-center gap-2 text-xs text-gray-500'>
            <span className='text-gray-800'>
              {' '}
              {formatTimestamp(notification.timestamp)}
            </span>
            <span className='text-gray-500'>
              {`| ${notification.source} |`}
            </span>
            <span>
              {notification.categories?.map((category, index) => (
                <span
                  className="mr-0.5 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
                  key={index}
                >
                  {category}
                </span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationItem
