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
    rotateText = false,
  } = useStateTab()

  const [activeTab, setActiveTab] = useState<string>(() => {
    // Only run on client side
    if (defaultValue) {
      return defaultValue;
    }

    if (typeof window !== 'undefined' && persistKey) {
      const savedTab = localStorage.getItem(`tab-${persistKey}`)
      if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
        return savedTab
      }
    }
    return tabs[0]?.id || '';
  })

  // Persist active tab
  useEffect(() => {
    if (persistKey && activeTab && !defaultValue) {
      localStorage.setItem(`tab-${persistKey}`, activeTab)
    }
  }, [activeTab, persistKey, defaultValue])

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      className={cn('w-full', className)}
      onValueChange={setActiveTab}
    >
      <div className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-row gap-2' : 'flex-col',
        orientation === 'vertical' && position === 'left' && 'flex-row-reverse'
      )}>
        <TabsList 
          variant={variant} 
          orientation={orientation}
          position={position}
          className={cn(
            orientation === 'vertical' && 'flex-col h-auto min-w-fit '
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
                rotateText={rotateText}
                position={position}
                className={cn(
                  orientation === 'vertical' && 'justify-start w-full',
                  orientation === 'vertical' && rotateText && 'writing-mode-vertical-rl'
                )}
              >
                
                {tab.icon && (
                  <span className={cn(
                    orientation === 'vertical' && rotateText && position === 'right' && '-rotate-90 transform',
                    orientation === 'vertical' && rotateText && position === 'left' && 'rotate-90 transform'
                  )}>
                    {tab.icon}
                  </span>
                )}
                <span className={cn(
                  orientation === 'vertical' && rotateText && position === 'right' && 'rotate-180 transform',
                  orientation === 'vertical' && rotateText && position === 'left' && 'rotate-0 transform'
                )}>
                  {tab.label}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
        <div className={cn(
          orientation === 'vertical' ? 'flex-1' : 'w-full',
          orientation === 'vertical' && position === 'left' && 'mr-2',
          orientation === 'vertical' && position === 'right' && 'ml-2'
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
  rotateText,
}: StateTabProps) => {
  return (
    <StateTabProvider
      value={{ tabs, variant, size, orientation, position, defaultValue, rotateText }}
    >
      <StateTabList className={className} persistKey={persistKey} />
    </StateTabProvider>
  )
}

export default StateTab
