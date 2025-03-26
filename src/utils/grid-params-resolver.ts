import { type SortingState } from '@tanstack/react-table'

import { type ISearchItem } from '~/components/platform/Grid/Search/types'

interface GridParams {
  sorts: {
    groupSorts?: SortingState
    sorting?: SortingState
    defaultSorting?: SortingState
  }
  filters: {
    groupAdvanceFilters?: ISearchItem[]
    advanceFilter?: ISearchItem[]
  }
  groups: { field?: string }[]
  pagination: {
    current_page?: string | number
    limit_per_page?: string | number
  }
  entity: string
  pluck?: string[]
  defaultAdvanceFilter?: ISearchItem[]
  defaultSorting?: SortingState
}

export const resolveGridParams = ({
  sorts,
  filters,
  groups,
  pagination,
  entity,
  pluck = [],
  defaultAdvanceFilter = [],
  defaultSorting = [],
}: GridParams) => {
  const gridAdvanceFilter = filters?.groupAdvanceFilters?.length
    ? filters.groupAdvanceFilters
    : filters?.advanceFilter?.length
      ? filters.advanceFilter
      : defaultAdvanceFilter

  const gridDefaultAdvanceFilter = filters?.groupAdvanceFilters?.length
    ? filters.groupAdvanceFilters
    : gridAdvanceFilter

  return {
    current: +(pagination?.current_page ?? '1'),
    limit: +(pagination?.limit_per_page ?? '100'),
    entity,
    pluck,
    sorting: sorts.groupSorts?.length
      ? sorts.groupSorts
      : sorts?.sorting?.length
        ? sorts?.sorting
        : defaultSorting,
    advance_filters: filters?.groupAdvanceFilters?.length
      ? []
      : filters?.advanceFilter?.length
        ? filters.advanceFilter
        : defaultAdvanceFilter,
    group_advance_filters: filters?.groupAdvanceFilters?.length
      ? filters.groupAdvanceFilters
      : [],
    grouping: groups?.[0]?.field ? [groups[0].field] : [],
    gridAdvanceFilter,
    gridDefaultAdvanceFilter,
  }
}
