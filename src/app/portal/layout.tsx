import { cookies } from 'next/headers'
import React from 'react'

import AppLayout from '~/components/application-layout/AppLayout'
import { NotificationProvider } from '~/components/application-layout/Header/Notifications/NotificationProvider'
import SideBarMenu from '~/components/application-layout/SideBarMenu'
import { SideDrawerProvider } from '~/components/platform/SideDrawer'
import { SidebarProvider } from '~/components/ui/sidebar'
import { SmartProvider } from '~/components/ui/smart-component'

import SessionChecker from '../session-checker'
import { Toaster } from '~/components/ui/sonner'

interface Props {
  children: React.ReactNode
}

const layout = async ({ children }: Props) => {
  const cookieStore = await cookies()
  const sidebar_state = cookieStore.get('sidebar_state')
  const value = !sidebar_state?.value ? true : sidebar_state?.value === 'false'

  return (
    <NotificationProvider>
      <SmartProvider>
        <SideDrawerProvider>
          <SidebarProvider defaultOpen={value}>
            <SideBarMenu />
            <SessionChecker />
            <Toaster/>
            <AppLayout>{children}
            </AppLayout>
          </SidebarProvider>
        </SideDrawerProvider>
      </SmartProvider>
    </NotificationProvider>
  )
}

export default layout
