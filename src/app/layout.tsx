import "../styles/globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/context/ThemeProvider";
import { ToastProvider } from "../context/ToastProvider";
import config from "~/styles/config/config.json";
import { EventEmitterProvider } from "~/context/EventEmitterProvider";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Platform",
  description: "All in one platform for recruitment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="email=no" />
      </head>
      <body>
        <TRPCReactProvider>
          <EventEmitterProvider>
            <TooltipProvider>
              <ToastProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                  layout={config.ApplicationLayout}
                >
                  {children}
                </ThemeProvider>
              </ToastProvider>
            </TooltipProvider>
          </EventEmitterProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
