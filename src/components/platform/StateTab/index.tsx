'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import { StateTabProvider, useStateTab } from './Provider'
import { type StateTabProps } from './types'
import { cn } from '~/lib/utils'
import { useSidebar } from '~/components/ui/sidebar'

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
  
  // Get sidebar state if this is being used in the sidebar
  const sidebarState = useSidebar();
  const isSidebarTab = persistKey === 'sidebar-tabs';
  // Only collapse tabs on desktop when sidebar is closed, not on mobile
  const shouldCollapse = isSidebarTab && !sidebarState.open && !sidebarState.openMobile;
  // const open = isSidebarTab ? sidebarState.open : true;

  const [activeTab, setActiveTab] = useState<string>(() => {
    // Check for saved tab first, regardless of defaultValue
    if (typeof window !== 'undefined' && persistKey) {
      const savedTab = localStorage.getItem(`tab-${persistKey}`)
      if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
        return savedTab
      }
    }
    
    // Fall back to defaultValue or first tab
    if (defaultValue) {
      return defaultValue;
    }
    
    return tabs[0]?.id || '';
  })

  // Persist active tab
  useEffect(() => {
    if (persistKey && activeTab) {
      localStorage.setItem(`tab-${persistKey}`, activeTab)
    }
  }, [activeTab, persistKey])

  // Filter tabs when sidebar is collapsed (only on desktop)
  const visibleTabs = React.useMemo(() => {
    if (shouldCollapse) {
      return tabs.filter(tab => tab.id === activeTab);
    }
    return tabs;
  }, [tabs, activeTab, shouldCollapse]);

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      className={cn('w-full', className)}
      onValueChange={setActiveTab}
    >
      <div className={cn(
        'flex flex-1',
        orientation === 'vertical' ? 'flex-row gap-2' : 'flex-col',
        orientation === 'vertical' && position === 'left' && 'flex-row-reverse',
        shouldCollapse && 'px-1 flex-1'
      )}>
        <TabsList 
          variant={variant} 
          orientation={orientation}
          position={position}
          className={cn(
            orientation === "horizontal" && "mb-4",
            orientation === 'vertical' && 'flex-col h-auto min-w-fit',
            // Improved centering for collapsed sidebar (desktop only)
            shouldCollapse && 'justify-center items-center w-full'
          )}
        >
          {visibleTabs.map((tab) => (
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
                "w-full",
                orientation === 'vertical' && 'justify-start w-full',
                orientation === 'vertical' && rotateText && 'writing-mode-vertical-rl',
                // Improved centering for collapsed sidebar (desktop only)
                shouldCollapse && 'justify-center items-center mx-auto flex-1 flex'
              )}
            >
              {tab.icon && (
                <span className={cn(
                  orientation === 'vertical' && rotateText && position === 'right' && '-rotate-90 transform',
                  orientation === 'vertical' && rotateText && position === 'left' && 'rotate-90 transform',
                  // Center icon when sidebar is collapsed (desktop only)
                  shouldCollapse && 'mx-auto flex justify-center items-center'
                )}>
                  {tab.icon}
                </span>
              )}
              <span className={cn(
                orientation === 'vertical' && rotateText && position === 'right' && 'rotate-180 transform',
                orientation === 'vertical' && rotateText && position === 'left' && 'rotate-0 transform',
                // Center text when sidebar is collapsed (desktop only)
                shouldCollapse && 'mx-auto text-center'
              )}>
                {tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Content section remains the same */}
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
