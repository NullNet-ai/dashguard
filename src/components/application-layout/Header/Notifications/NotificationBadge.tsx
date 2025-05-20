'use client'
import { Menu, MenuButton } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'

import { registerDrawerType, useSideDrawer } from '~/components/platform/SideDrawer'

import NotificationDrawer, { HeaderSection } from './components/NotificationDrawer'
import { useNotifications } from './NotificationProvider'

registerDrawerType('notification', {
  component: NotificationDrawer,
  header: <HeaderSection />,
  options: {
    sideDrawerWidth: '500px',
    resizable: true,
    isPinnable: true,
    maxResizeWidth: '500px'
  }
});

function NotificationBadge() {
  const { state } = useNotifications()
  const { actions, state: drawerState } = useSideDrawer()
  const { totalUnreadNotificationCount } = state

  const handleToggleSideDrawer = () => {
    if (drawerState.isOpen && drawerState.config?.drawerType === 'notification') {
      actions?.closeSideDrawer()
    } else {
      actions?.openSideDrawer('notification')
    }
  }

  return (
    <Menu as='div' className='relative inline-block text-left me-4 '>
      <div>
        <MenuButton
          className='flex items-center rounded-full '
          onClick={handleToggleSideDrawer}
        >
          <span className='sr-only'>Open Notifications</span>
          <BellIcon className='h-6 w-6 text-foreground' />
        </MenuButton>
      </div>

      {totalUnreadNotificationCount > 0 && (
        <span className='absolute right-0 top-[7px] inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-1 py-1 text-[12px] font-bold leading-none text-red-100'>
          {totalUnreadNotificationCount > 99 ? '99+' : totalUnreadNotificationCount}
        </span>
      )}
    </Menu>
  )
}

export default NotificationBadge
