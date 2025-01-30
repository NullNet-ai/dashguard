'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { StateTabProvider, useStateTab } from './Provider'
import { type StateTabProps } from './types'
import { cn } from '~/lib/utils'

function StateTabList({
  className,
  persistKey,
}: {
  className?: string
  persistKey?: string
}) {
  const {
    tabs,
    defaultValue,
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
  } = useStateTab()

  const [activeTab, setActiveTab] = useState<string>(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && persistKey) {
      const savedTab = localStorage.getItem(`tab-${persistKey}`)
      if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
        return savedTab
      }
    }
    return defaultValue || tabs[0]?.id || ''
  })

  // Persist active tab
  useEffect(() => {
    if (persistKey && activeTab) {
      localStorage.setItem(`tab-${persistKey}`, activeTab)
    }
  }, [activeTab, persistKey])

  // Remove the restore effect since we handle it in initial state

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab} // Add controlled value
      className={cn('w-full', className)}
      onValueChange={setActiveTab}
    >
      <TabsList variant={variant} orientation={orientation}>
        {tabs.map((tab) => {
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              size={size}
              variant={variant}
              iconPosition={tab.iconPosition}
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
      <div className="mt-4">
        {tabs.map((tab) => {
          return (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.content}
            </TabsContent>
          )
        })}
      </div>
    </Tabs>
  )
}

const StateTab = ({
  tabs,
  variant,
  size,
  orientation,
  className,
  persistKey,
  defaultValue,
}: StateTabProps) => {
  return (
    <StateTabProvider
      value={{ tabs, variant, size, orientation, defaultValue }}
    >
      <StateTabList className={className} persistKey={persistKey} />
    </StateTabProvider>
  )
}

export default StateTab
