/* eslint-disable react/jsx-curly-brace-presence */
import React from 'react'
import Image from 'next/image'

const EmptyNotification = () => {
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
        No Notifications Yet.
      </p>
    </div>
  )
}

export default EmptyNotification
