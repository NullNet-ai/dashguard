import { type SortingState } from '@tanstack/react-table'

import { type ISearchItem } from '../Search/types'

import { type IGridCacheDataResponse } from './grid-get-cache-data'
import { resolveGridParams } from './grid-params-resolver'

interface IGridDataResolver {
  entity: string
  gridCacheData: IGridCacheDataResponse
  defaults: {
    defaultAdvanceFilter?: ISearchItem[]
    defaultSorting?: SortingState
  }
  pluck?: string[]
}

export const gridDataResolver = ({
  gridCacheData,
  defaults,
  entity,
  pluck,
}: IGridDataResolver) => {
  const { grid_tabs, sorts, filters, groups, pagination } = gridCacheData ?? {}
  const { defaultSorting, defaultAdvanceFilter: _defaultAdvanceFilter } = defaults ?? {}

  const defaultAdvanceFilter = _defaultAdvanceFilter?.length
    ? _defaultAdvanceFilter
    : filters?.defaultFilters

  const gridParams = resolveGridParams({
    ...gridCacheData,
    ...defaults,
    defaultAdvanceFilter,
    entity,
    pluck,
  })

  const gridAdvanceFilter = filters?.groupAdvanceFilters?.length
    ? filters.groupAdvanceFilters
    : filters?.reportFilters?.length
      ? filters.reportFilters
      : defaultAdvanceFilter

  const gridDefaultAdvanceFilter = filters?.groupAdvanceFilters?.length
  ? filters.groupAdvanceFilters
  : gridAdvanceFilter
  const gridProps = {
    grid_tabs,
    defaultSorting: sorts?.defaultSorting.length
      ? sorts?.defaultSorting
      : defaultSorting,
    defaultAdvanceFilter: gridDefaultAdvanceFilter,
    advanceFilter: gridAdvanceFilter,
    sorting: sorts?.sorting || [],
    grouping: groups || [],
    pagination
  }
  return { gridParams, gridProps }
}
