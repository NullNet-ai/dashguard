import { cookies } from 'next/headers'
import React from 'react'

import AppLayout from '~/components/application-layout/AppLayout'
import SideBarMenu from '~/components/application-layout/SideBarMenu'
import { SideDrawerProvider } from '~/components/platform/SideDrawer'
import { SidebarProvider } from '~/components/ui/sidebar'
import { SmartProvider } from '~/components/ui/smart-component'
import SessionChecker from '../session-checker'

interface Props {
  children: React.ReactNode
}

const layout = async ({ children }: Props) => {
  const cookieStore = cookies()
  const sidebar_state = cookieStore.get('sidebar_state')
  const value = !sidebar_state?.value ? true : sidebar_state?.value === 'false'

  return (
    <SmartProvider>
      <SideDrawerProvider>
        <SidebarProvider defaultOpen={value}>
          <SideBarMenu />
          <SessionChecker />
          <AppLayout>{children}</AppLayout>
        </SidebarProvider>
      </SideDrawerProvider>
    </SmartProvider>
  )
}

export default layout
