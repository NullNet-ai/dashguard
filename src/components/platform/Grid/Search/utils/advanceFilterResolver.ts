import { type ISearchItem } from '../types'

export const resolveAdvanceFilter = ({
  currentAdvanceFilter,
  additionalFilter,
}: {
  currentAdvanceFilter: ISearchItem[]
  additionalFilter: ISearchItem[]
}) => {
  const hasFilters = currentAdvanceFilter.some(
    item => item.filters && item.filters.length > 0,
  )

  if (hasFilters) {
    const searchItemResolver = currentAdvanceFilter.map((item: any) => {
      if (item.filters) {
        return {
          ...item,
          filters: [
            ...item.filters,
            ...(additionalFilter?.length
              ? [
                  {
                    type: 'operator',
                    operator: 'and',
                  },
                ]
              : []),
            ...additionalFilter,
          ],
        }
      }
      return item
    }) as ISearchItem[]
    return {
      group_advance_filters: searchItemResolver,
      advance_filters: [],
    }
  }

  // If `filters` key does not exists
  const searchItemResolver = [
    ...additionalFilter,
    ...(currentAdvanceFilter.length
      ? [{ type: 'operator', operator: 'and', default: false }]
      : []),
    ...currentAdvanceFilter,
  ] as ISearchItem[]

  return {
    group_advance_filters: [],
    advance_filters: searchItemResolver,
  }
}
