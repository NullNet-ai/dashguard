import { TabItem } from './tab'

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