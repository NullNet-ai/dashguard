import React from 'react'

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  forceMount?: boolean
}

export interface StateTabContextType {
  tabs: TabItem[]
  variant?: 'default' | 'pills' | 'underline'|'shadow'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  position?: 'left' | 'right'
  defaultValue?: string
  rotateText?:boolean
}

export interface StateTabProps extends StateTabContextType {
  className?: string
  persistKey?: string
  tablistClassName?: string
  isStickyContainer?: boolean
  stickyClassName?: string
}
