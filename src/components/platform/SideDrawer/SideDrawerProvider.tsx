'use client'

import React, { createContext, useContext, useState } from 'react'

import {
  type IActions,
  type ISideDrawerConfig,
  type ISideDrawerContextProps,
} from './types'

const SideDrawerContext = createContext<ISideDrawerContextProps | undefined>(undefined)
export const PINNED_STATE_KEY = 'sideDrawer_isPinned'

export const SideDrawerProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ISideDrawerConfig | null>(null)

  const openSideDrawer = (config: ISideDrawerConfig) => {
    setConfig(config)
    setIsOpen(true)
  }

  const closeSideDrawer = () => {
    if (config?.onCloseSideDrawer) {
      config.onCloseSideDrawer()
    }
    setIsOpen(false)
    setConfig(null)
  }

  const actions: IActions = {
    openSideDrawer,
    closeSideDrawer,
  }

  return (
    <SideDrawerContext.Provider value={{
      state: {
        isOpen,
        config,
      },
      actions,
    }}
    >
      {children}
    </SideDrawerContext.Provider>
  )
}

export function useSideDrawer() {
  const context = useContext(SideDrawerContext)
  if (!context) {
    throw new Error('useSideDrawer must be used within a SideDrawerProvider')
  }
  return context
}
