'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { EllipsisVertical, Mail, MailOpen, Pin } from 'lucide-react'
import { Fragment, useEffect } from 'react'
import * as Lucide from 'lucide-react';
import capitalize from 'lodash/capitalize';
import { Button } from '~/components/ui/button'

import { useNotifications } from '../NotificationProvider'
import { type TNotificationType, type INotificationSchema } from '../types'

import EmptyNotification from './EmptyNotification'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import TextTruncate from '~/components/ui/text-truncate';
import EmptyUnreadNotification from './EmptyUnreadNotification';
import { cn } from '~/lib/utils';
import { NotificationSkeleton } from './NotificationDrawer';
interface DynamicIconProps extends Lucide.LucideProps {
  name: keyof typeof Lucide;
}

const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const IconComponent = Lucide[name] as React.ElementType;

  if (!IconComponent) {
    return <Lucide.Bell className='size-4 text-gray-500' />;
  }

  return <IconComponent {...props} />;
};
const NotificationItem = ({ type }: { type: TNotificationType }) => {
  const { state, actions } = useNotifications()
  const { notificationCount, loading, totalNotificationCount, notifications } = state

  useEffect(() => {
    actions.handleChangeType(type)
  }, [])


  if (loading) {
    return (
      <NotificationSkeleton />
    );
  }
  // if no unread notification
  if (totalNotificationCount === 0) {
    return <EmptyNotification />
  }
  // if no notification at all
  if (!notificationCount && totalNotificationCount > 0) {
    return <EmptyUnreadNotification />
  }





  // Function to format the event_timestamp
  const formatTimestamp = (event_timestamp: string) => {
    const date = new Date(event_timestamp)
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


  function handleButtonVariants(className: string) {
    switch (className) {

      case 'bg-blue-500 text-white':
        return 'default'
      case 'bg-green-500 text-white':
        return 'success'
      case 'bg-red-500 text-white':
        return 'destructive'
      case 'bg-yellow-500 text-white':
        return 'soft'
      case 'bg-gray-500 text-white':
        return 'softSecondary'
      default:
        return 'default'

    }
  }

  return (
    <div className='mt-2'>
      {notifications.map((notification: INotificationSchema,index) => (
        <Fragment key={index}>
          <div
            className={`relative flex flex-col group cursor-pointer ${notification.notification_status === 'read'
              ? ''
              : ' border-l-primary border-l-4 sm:border-l-2'
              } p-3 shadow-sm lg:hover:bg-primary/10 transition-colors duration-200 `}
            onClick={() => notification.link && handleOpenNewTab(notification.link)}
            key={notification.id}
          >
            {/* Title & Priority */}
            <div className='flex item-start justify-between'>
              {/* Icon & Title */}
              <div className='flex items-center gap-2 cursor-default' onClick={(e) => { e.stopPropagation() }}>
                {notification.icon
                  ? (
                    // @ts-expect-error fix this later
                    <DynamicIcon name={capitalize(notification.icon)} className='size-4 text-gray-500 ' />
                  )
                  : (
                    <Mail className='size-4 text-gray-500 ' />
                  )}
                <a
                  className={cn(
                    `text-sm font-semibold hover:underline text-primary cursor-pointer `,
                    notification.notification_status === 'read' ? 'text-foreground font-normal' : ''
                  )}
                  onClick={() => notification.link && handleOpenNewTab(notification.link)}
                  aria-hidden="true"
                >
                  {notification.title}
                </a>
              </div>

              <div className=' items-center flex'>
                {/* Read / Unread Icon */}
                {notification.notification_status === 'read'
                  ? (
                    <MailOpen
                      className='h-4 w-4 text-gray-300 group-hover:block hidden cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        actions?.handleSingleReadUnread({
                          id: notification.id,
                          notification_status: 'unread',
                        })
                      }}
                    />
                  )
                  : (
                    <Mail
                      className='h-4 w-4 text-gray-300 group-hover:block hidden cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation()
                        actions?.handleSingleReadUnread({
                          id: notification.id,
                          notification_status: 'read',
                        })
                      }}
                    />
                  )}
                {/* Pin Icon */}
                <Pin
                  className={`h-4 w-4 cursor-pointer mx-2 ${notification.is_pinned ? 'fill-yellow-300 text-yellow-500' : 'text-gray-300 group-hover:block hidden'}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    actions?.handlePinNotification({
                      id: notification.id,
                      is_pinned: !notification.is_pinned,
                      type,
                    })
                  }}
                />
                {/* Priority Badge */}
                <Badge
                  className='text-xs font-medium'
                  borderRadius={'md'}
                  variant={notification.priority_level === 2 ? 'destructive' : notification.priority_level === 1 ? 'warning' : 'secondary'}

                >
                  {notification.priority_label.toUpperCase()}
                </Badge>
                {/* Dropdown Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true} onClick={(e) => e.stopPropagation()}>
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
                            onClick={(e) => {
                              e.stopPropagation()
                              actions?.handleRestoreNotificationStatus(notification.id)
                            }}
                          >
                            <p>Restore</p>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
                        text-red-600 outline-none transition-colors hover:bg-red-50'
                            onClick={(e) => {
                              e.stopPropagation()
                              actions?.handleDeleteNotification(notification.id)
                            }}
                          >
                            <p>Delete</p>
                          </DropdownMenuItem>
                        </>
                      )
                      : (
                        <DropdownMenuItem
                          className='relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
                      outline-none transition-colors hover:bg-gray-100 hover:text-gray-900'
                          onClick={(e) => {
                            e.stopPropagation()
                            actions?.handleArchiveNotification(notification)
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            <TextTruncate className='text-sm text-secondary-foreground ms-6' text={notification.description} maxCharacters={70} />

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className='flex gap-2 ms-6 mt-1'>
                {notification.actions.map((action, index) => (
                  //*  To be discussed whether to add property buttonVariant as identitifier on which button to use instead of className
                  // <Button className={action?.className}  key={index} size="sm" variant={handleButtonVariants(action?.className || '')}>
                  <Button key={index} size="sm" variant={handleButtonVariants(action?.className || '')}>
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
            {/* Metadata */}
            <div className='flex items-center gap-2 text-[10px] text-gray-500 ms-6 mt-2'>
              <span className='!text-gray-500'>
                {' '}
                {formatTimestamp(notification.event_timestamp)}
              </span>
              <span className='!text-gray-500'>
                {`| ${notification.source} |`}
              </span>
              <span>
                {notification.categories?.map((category, index) => (
                  <span
                    className="mr-0.5 rounded-full bg-gray-200 px-2 py-0.5 text-[10px]  !text-gray-500"
                    key={index}
                  >
                    {category}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <Separator dashed />
        </Fragment>
      ))}
    </div>
  )
}

export default NotificationItem
