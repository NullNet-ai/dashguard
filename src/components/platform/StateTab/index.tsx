'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { StateTabProvider, useStateTab } from './Provider'
import { getStateTabStyles } from './styles'
import { StateTabProps } from './types'

function StateTabList({
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
  const styles = getStateTabStyles(variant, size, orientation)

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
      if (
        savedTab &&
        tabs.some((tab) => {
          return tab.id === savedTab
        })
      ) {
        setActiveTab(savedTab)
      }
    }
  }, [isClient, tabs, persistKey])

  return (
    <Tabs
      defaultValue={activeTab}
      className={styles.root}
      onValueChange={setActiveTab}
    >
      <TabsList className={styles.list}>
        {tabs.map((tab) => {
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={styles.trigger(tab.id === activeTab)}
              disabled={tab.disabled}
            >
              {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
              {tab.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
      <div className={styles.content}>
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
