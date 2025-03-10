import type React from 'react'
export interface SearchItem {
  id: string
  name: string
  value: string
  label: string
}

export interface IState {
  filters: Record<string, any>[]
  query: string
  filterQuery: Record<string, any>
  setFilterQuery: (filter: Record<string, any>) => void
  _refetchTrigger: number
  _setRefetchTrigger: any
}

export interface IAction {
  handleOnChange: (e: any) => void
  handleDelete: ({ id }: { id: string }) => Promise<void>
  handleDuplicateTab: (tab: Record<string, any>) => Promise<void>

}
export interface IFilterContext {
  state?: IState
  actions?: IAction
}

export interface IProps {
  children: React.ReactNode
}

export interface IFilter {
  id: string
  name?: string
  label: string
  default_filter: Record<string, any>[]
  values?: SearchItem[]
  type?: string
}

export interface IData {
  modifyFilterDetails: IFilter
}
