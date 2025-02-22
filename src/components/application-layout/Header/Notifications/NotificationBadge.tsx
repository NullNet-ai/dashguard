'use client'
import { Menu, MenuButton } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'

import { useSideDrawer } from '~/components/platform/SideDrawer'

import NotificationDrawer, { HeaderSection } from './components/NotificationDrawer'
import { useNotifications } from './NotificationProvider'

function NotificationBadge() {
  const { state } = useNotifications()
  const { actions,state:drawerState } = useSideDrawer()

  const { notificationCount } = state

  const handleToggleSideDrawer = () => {
    if (drawerState.isOpen) {
      actions?.closeSideDrawer()
    } else {
      actions?.openSideDrawer({
        header: <HeaderSection />,
        sideDrawerWidth: '500px',
        body: {
          component: NotificationDrawer,
        },
      })
    }
  }

  return (
    <Menu as='div' className='relative inline-block text-left mx-4'>
      <div>
        <MenuButton
          className='flex items-center rounded-full'
          onClick={handleToggleSideDrawer}
        >
          <span className='sr-only'>Open Notifications</span>
          <BellIcon className='h-6 w-6 text-foreground' />
        </MenuButton>
      </div>

      {notificationCount > 0 && (
        <span className='absolute right-0 top-[3px] inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-1 py-1 text-[12px] font-bold leading-none text-red-100'>
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </Menu>
  )
}

export default NotificationBadge
