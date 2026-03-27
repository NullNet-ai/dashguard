import React from 'react'

export interface SidebarTabItem {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  forceMount?: boolean
}

export interface SidebarTabContextType {
  tabs: SidebarTabItem[]
  variant?: 'default' | 'pills' | 'underline'|'shadow'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  position?: 'left' | 'right'
  defaultValue?: string
  rotateText?: boolean
  activeTab?: string
  setActiveTab?: (tabId: string) => void
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
}

export interface SidebarTabProps extends SidebarTabContextType {
  className?: string
  persistKey?: string
  tablistClassName?: string
  isStickyContainer?: boolean
  stickyClassName?: string
  stickyTop?: number
  itemClassName?: string
  forceDefault?: boolean
  onStateChanged?: (tabId: string) => void
  refreshOnTabChange?: boolean
  refreshOnTabChangeTabs?: string[]
}
