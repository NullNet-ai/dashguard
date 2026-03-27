'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { SidebarTabContextType } from './types'

const SidebarTabContext = createContext<SidebarTabContextType | undefined>(
  undefined
)

export function SidebarTabProvider({
  children,
  value,
}: {
  children: ReactNode
  value: SidebarTabContextType & {
    isCollapsed?: boolean
    setIsCollapsed?: (collapsed: boolean) => void
  }
}) {
  return (
    <SidebarTabContext.Provider value={value}>
      {children}
    </SidebarTabContext.Provider>
  )
}

export function useSidebarTab() {
  const context = useContext(SidebarTabContext)
  if (!context) {
    throw new Error('useSidebarTab must be used within SidebarTabProvider')
  }
  return context
}