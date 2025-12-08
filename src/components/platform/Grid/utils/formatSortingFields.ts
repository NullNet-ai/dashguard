import { type SortingState } from '@tanstack/react-table'

import { type CustomColumnDef } from '../types'

export const formatSortingFields = (
  sorting: SortingState,
  columns?: CustomColumnDef<any>[],
) => {
  const processedSortKeys = new Map()

  const resolvedSorting = sorting?.reduce((acc: SortingState, sort) => {
    const sortFields = columns?.find(
      (column: any) => column?.accessorKey === sort.id,
    )

    const resolvedSortFields = Array.isArray(sortFields?.sortKey)
      ? sortFields?.sortKey.map((sortKey: any) => {
        const key = `${sort.id}_${sortKey}`
        // If we've already processed this combination, skip it
        if (processedSortKeys.has(key)) {
          return null
        }
        processedSortKeys.set(key, true)
        return {
          ...sort,
          ...(sortFields?.sort_config ?? {}),
          sort_key: sortKey,
        }
      })
      : (() => {
          const key = `${sort.id}_${sortFields?.sortKey || sort.id}`
          if (processedSortKeys.has(key)) {
            return null
          }
          processedSortKeys.set(key, true)
          return [
            {
              ...sort,
              ...(sortFields?.sort_config ?? {}),
              sort_key: sortFields?.sortKey || sort.id,
            },
          ]
        })()

    return [...acc, ...(resolvedSortFields?.filter(Boolean) as SortingState) ?? []]
  }, [])
  return resolvedSorting
}
