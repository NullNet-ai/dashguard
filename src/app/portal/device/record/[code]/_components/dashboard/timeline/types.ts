import type React from 'react'
export interface SearchItem {
  id: string
  name: string
  value: string
}

export interface IState {
  filters: string[]
  query: string
}

export interface IAction {
  addFilter: (filter: string) => void
  handleOnChange: (e: any) => void
  handleDelete: ({ id }: { id: string }) => void
  handleDuplicateTab: (tab: Record<string, any>) => void
}

export interface IFilterContext {
  state?: IState
  actions?: IAction
}

export interface IProps {
  children: React.ReactNode
}
