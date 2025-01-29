"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { LayoutProvider } from "./LayoutProvider"

export function ThemeProvider({ children, ...props }: ThemeProviderProps & { children: React.ReactNode , layout: string }) {

  const { layout } = props

  return <NextThemesProvider {...props}>
    <LayoutProvider layout={layout}>
      {children}
    </LayoutProvider>
  </NextThemesProvider>
}
