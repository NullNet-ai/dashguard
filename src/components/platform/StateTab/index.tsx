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
    position = 'right',
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

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      className={cn('w-full', className)}
      onValueChange={setActiveTab}
    >
      <div className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-row gap-4' : 'flex-col',
        orientation === 'vertical' && position === 'left' && 'flex-row-reverse'
      )}>
        <TabsList 
          variant={variant} 
          orientation={orientation}
          className={cn(
            orientation === 'vertical' && 'flex-col h-auto min-w-fit'
          )}
        >
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                size={size}
                variant={variant}
                iconPosition={tab.iconPosition}
                className={cn(
                  orientation === 'vertical' && 'justify-start w-full'
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
        <div className={cn(
          orientation === 'vertical' ? 'flex-1' : 'w-full',
          orientation === 'vertical' && position === 'left' && 'mr-4',
          orientation === 'vertical' && position === 'right' && 'ml-4'
        )}>
          {tabs.map((tab) => {
            return (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.content}
              </TabsContent>
            )
          })}
        </div>
      </div>
    </Tabs>
  )
}

const StateTab = ({
  tabs,
  variant,
  size,
  orientation,
  position,
  className,
  persistKey,
  defaultValue,
}: StateTabProps) => {
  return (
    <StateTabProvider
      value={{ tabs, variant, size, orientation, position, defaultValue }}
    >
      <StateTabList className={className} persistKey={persistKey} />
    </StateTabProvider>
  )
}

export default StateTab
