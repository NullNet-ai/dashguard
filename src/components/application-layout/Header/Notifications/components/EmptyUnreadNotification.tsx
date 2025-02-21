
/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react'
import Image from 'next/image'

const EmptyUnreadNotification = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-10'>
      <Image
        width={60}
        height={60}
        alt=""
        src="/unreadNotifications.svg"
        className="h-32 w-auto block"
      />
      <p className='mt-4 text-gray-600'>
       You're all caught up! No unread notifications.
      </p>
    </div>
  )
}

export default EmptyUnreadNotification
