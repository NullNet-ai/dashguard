/* eslint-disable react/jsx-curly-brace-presence */
import { Inbox } from 'lucide-react'
import React from 'react'

const EmptyNotification = () => {
  return (
    <div className='flex h-64 flex-col items-center justify-center'>
      <Inbox className='h-12 w-12 text-blue-500' />
      <p className='mt-2 text-gray-600'>
        You&apos;re all caught up! No unread notifications.
      </p>
    </div>
  )
}

export default EmptyNotification
