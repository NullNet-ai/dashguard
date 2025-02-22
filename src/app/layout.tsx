import '../styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'

import { TooltipProvider } from '~/components/ui/tooltip'
import { EventEmitterProvider } from '~/context/EventEmitterProvider'
import { ThemeProvider } from '~/context/ThemeProvider'
import config from '~/styles/config/config.json'
import { TRPCReactProvider } from '~/trpc/react'

import { ToastProvider } from '../context/ToastProvider'
import { OpenReplayProvider } from '~/context/OpenReplay';

export const metadata: Metadata = {
  title: 'Nullnet',
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
      lang="en"
      suppressHydrationWarning = { true }
    >
      <head>
        <meta content = "telephone=no" name = "format-detection" />
        <meta content = "email=no" name = "format-detection" />
      </head>
      <body>
       <OpenReplayProvider>
       <TRPCReactProvider>
          <EventEmitterProvider>
            <TooltipProvider>
              <ToastProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  disableTransitionOnChange = { true }
                  enableSystem = { true }
                  layout={config.ApplicationLayout}
                >
                  {children}
                </ThemeProvider>
              </ToastProvider>
            </TooltipProvider>
          </EventEmitterProvider>
        </TRPCReactProvider>
        </OpenReplayProvider>
      </body>
    </html>
  )
}
