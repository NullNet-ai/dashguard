import '../styles/globals.css';
// eslint-disable-next-line import/no-unresolved
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import { TooltipProvider } from '~/components/ui/tooltip';
import { EventEmitterProvider } from '~/context/EventEmitterProvider';
import { ThemeProvider } from '~/context/ThemeProvider';
import config from '~/styles/config/config.json';
import { TRPCReactProvider } from '~/trpc/react';

import { ToastProvider } from '../context/ToastProvider';
import { NotificationProvider } from '~/components/application-layout/Header/Notifications/NotificationProvider';

export const metadata: Metadata = {
  title: 'Platform',
  description: 'All in one platform for recruitment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${GeistSans.className}`}
      lang="en"
      suppressHydrationWarning={true}
    >
      <head>
        <meta content="telephone=no" name="format-detection" />
        <meta content="email=no" name="format-detection" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <TRPCReactProvider>
            <EventEmitterProvider>
              <TooltipProvider>
                <ToastProvider>
                  <NotificationProvider>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="light"
                      disableTransitionOnChange={true}
                      enableSystem={true}
                      layout={config.ApplicationLayout}
                    >
                      {children}
                    </ThemeProvider>
                  </NotificationProvider>
                </ToastProvider>
              </TooltipProvider>
            </EventEmitterProvider>
          </TRPCReactProvider>
        </Suspense>
      </body>
    </html>
  );
}
