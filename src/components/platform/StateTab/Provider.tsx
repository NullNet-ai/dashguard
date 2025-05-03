'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
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
  // Initialize activeTab state with defaultValue or first tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (value.defaultValue) {
      return value.defaultValue;
    }
    return value.tabs[0]?.id || '';
  });

  // Create enhanced context value with activeTab state
  const contextValue = {
    ...value,
    activeTab,
    setActiveTab,
  };

  return (
    <StateTabContext.Provider value={contextValue}>
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
