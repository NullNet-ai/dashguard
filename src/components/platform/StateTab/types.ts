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
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  defaultValue?: string
}

export interface StateTabProps extends StateTabContextType {
  className?: string
  persistKey?: string
}
