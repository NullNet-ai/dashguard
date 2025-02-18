'use client'
import { Menu, MenuButton } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'

import { useSideDrawer } from '~/components/platform/SideDrawer'

import NotificationDrawer from './components/NotificationDrawer'
import { useNotifications } from './NotificationProvider'

function NotificationBadge() {
  const { state } = useNotifications()
  const { actions } = useSideDrawer()

  const { notificationCount } = state

  const handleOpenSideDrawer = () => {
    actions?.openSideDrawer({
      title: '',
      sideDrawerWidth: '500px',
      body: {
        component: NotificationDrawer,
      },
    })
  }

  return (
    <Menu as='div' className='relative inline-block text-left'>
      <div>
        <MenuButton
          className='flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100'
          onClick={handleOpenSideDrawer}
        >
          <span className='sr-only'>Open Notifcations</span>
          <BellIcon className='h-6 w-6 text-muted-foreground' />
        </MenuButton>
      </div>

      {notificationCount > 0 && (
        <span className='absolute right-2 top-1 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-red-100'>
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </Menu>
  )
}

export default NotificationBadge
