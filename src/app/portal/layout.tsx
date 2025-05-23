import { cookies } from 'next/headers'
import React from 'react'

import AppLayout from '~/components/application-layout/AppLayout'
import SideBarMenu from '~/components/application-layout/SideBarMenu'
import { SideDrawerProvider, SideDrawerView } from '~/components/platform/SideDrawer'
import { SidebarProvider } from '~/components/ui/sidebar'
import { SmartProvider } from '~/components/ui/smart-component'
import { Toaster } from '~/components/ui/sonner'

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
        <SideDrawerView />
        <SidebarProvider defaultOpen={value}>
          <Toaster />
          <SideBarMenu />
          <AppLayout>{children}</AppLayout>
        </SidebarProvider>
      </SideDrawerProvider>
    </SmartProvider>
  )
}

export default layout
