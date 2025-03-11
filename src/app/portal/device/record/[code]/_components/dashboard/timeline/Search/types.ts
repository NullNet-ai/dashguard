/* eslint-disable @typescript-eslint/no-empty-object-type */

import { type EOrderDirection, type IAdvanceFilters } from '@dna-platform/common-orm'

export interface IState {
  open: boolean
  searchItems: ISearchItem[]
  query: string
  advanceFilterItems: ISearchItem[]
  config: {
    searchableFields: ISearchableField[]
  }
  rawItems: Record<string,any>[]
}

export interface IAction {
  // eslint-disable-next-line no-undef
  handleQuery: (data: React.SetStateAction<string>) => void
  handleOpen: (open: boolean) => void
  handleSearchQuery: (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => ISearchResult | undefined
  handleAddSearchItem: (filterItem: ISearchItemResult) => Promise<void>
  handleRemoveSearchItem: (filterItem: ISearchItem) => Promise<void>
  handleClearSearchItems: () => Promise<void>
}

export interface ICreateContext {
  state?: IState
  actions?: IAction
}

export interface ISearchParams {
  entity: string
  pluck?: any
  pluck_object?: any
  current?: number
  limit?: number
  advance_filters?: IAdvanceFilters[]
  sorting?: any[]
}
export interface ISearchResult {
  totalCount: number
  items: Record<string, any>[]
  currentPage: number
  totalPages: number
}

export interface ISearchItem {
  type: string
  operator: string
  entity: string
  id?: string
  values?: string[]
  field?: string
  label?: string
  default?: boolean
  display_value?: string
}

export interface ISortItem {
  by_field: string
  by_direction: EOrderDirection
}

export interface ISearchItemResult extends ISearchItem {
  count: number
}

export interface ISearchableField {
  field: string
  label: string
  operator?: string
  entity?: string
  accessorKey?: string
}

export interface IPagination {
  current_page: number
  limit_per_page: number
}

export interface IAdvanceFilter {
  type: string
  operator: string
  field?: string
  entity?: string
  values?: string[]
}

export interface ISearchProps  {
  time_duration: {
    time_count: number,
    time_unit: string,
  }
}