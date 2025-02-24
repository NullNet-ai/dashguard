import '../styles/globals.css'
// eslint-disable-next-line import/no-unresolved
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import React, { Suspense } from 'react'

import { TooltipProvider } from '~/components/ui/tooltip'
import { EventEmitterProvider } from '~/context/EventEmitterProvider'
import { ThemeProvider } from '~/context/ThemeProvider'
import config from '~/styles/config/config.json'
import { TRPCReactProvider } from '~/trpc/react'

import { ToastProvider } from '../context/ToastProvider'
import { SidebarProvider } from '~/components/ui/sidebar'
import { OpenReplayProvider } from "~/context/OpenReplay";

export const metadata: Metadata = {
  title: 'Platform',
  description: 'All in one platform for recruitment',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={`${GeistSans.className}`}
      lang='en'
      suppressHydrationWarning={true}
    >
      <head>
        <meta content='telephone=no' name='format-detection' />
        <meta content='email=no' name='format-detection' />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <OpenReplayProvider>
          <TRPCReactProvider>
            <EventEmitterProvider>
              {/** TODO: put side bar inside the portal */}
              <SidebarProvider defaultOpen={false} className='block'>
                <TooltipProvider>
                  <ToastProvider>
                    <ThemeProvider
                      attribute='class'
                      defaultTheme='light'
                      disableTransitionOnChange={true}
                      enableSystem={true}
                      layout={config.ApplicationLayout}
                    >
                      {children}
                    </ThemeProvider>
                  </ToastProvider>
                </TooltipProvider>

              </SidebarProvider>
            </EventEmitterProvider>
          </TRPCReactProvider>
          </OpenReplayProvider>
        </Suspense>
      </body>
    </html>
  )
}
