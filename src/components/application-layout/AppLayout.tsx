import { headers } from 'next/headers'
import { type PropsWithChildren } from 'react'

import { SidebarInset } from '../ui/sidebar'

import AppContent from './common/AppContent'
import HeaderContainer from './common/HeaderContainer'
import Header from './Header'
import SmartComponent, { SmartMobileComponent } from './SmartComponent'
const AppLayout = async ({ children }: PropsWithChildren) => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , , app, ,] = pathname.split('/')

  return (
    <>
      <SidebarInset application_name={app}>
        <HeaderContainer>
          <Header />
        </HeaderContainer>
        <AppContent>{children}
        </AppContent>
        {/* <SmartComponent /> */}
        {/* <SmartMobileComponent /> */}
      </SidebarInset>
    </>
  )
}

export default AppLayout
