'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { StateTabProvider, useStateTab } from './Provider'
import { StateTabProps } from './types'
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

  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.id)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Persist active tab
  useEffect(() => {
    if (persistKey && activeTab) {
      localStorage.setItem(`tab-${persistKey}`, activeTab)
    }
  }, [activeTab, persistKey])

  // Restore persisted tab on mount
  useEffect(() => {
    if (persistKey && isClient) {
      const savedTab = localStorage.getItem(`tab-${persistKey}`)
      if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
        setActiveTab(savedTab)
      }
    }
  }, [isClient, tabs, persistKey])

  return (
    <Tabs
      defaultValue={activeTab}
      className={cn('w-full', className)}
      onValueChange={setActiveTab}
    >
      <TabsList variant={variant} size={size} orientation={orientation}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            variant={variant}
            disabled={tab.disabled}
          >
            {tab.icon && (
              <span className="mr-2 inline-flex items-center">{tab.icon}</span>
            )}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
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
