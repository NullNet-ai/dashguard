'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { StateTabContextType } from './types'

const StateTabContext = createContext<StateTabContextType | undefined>(
  undefined
)

export function StateTabProvider({
  children,
  value,
}: {
  children: ReactNode
  value: StateTabContextType
}) {
  return (
    <StateTabContext.Provider value={value}>
      {children}
    </StateTabContext.Provider>
  )
}

export function useStateTab() {
  const context = useContext(StateTabContext)
  if (!context) {
    throw new Error('useStateTab must be used within StateTabProvider')
  }
  return context
}
