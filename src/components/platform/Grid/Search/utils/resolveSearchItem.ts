import { ulid } from 'ulid'

import { type ISearchItem } from '../types'

export const resolveSearchItem = ({
  advanceFilter,
  rest,
}: {
  advanceFilter: ISearchItem[]
  rest: ISearchItem
}) => {
  const hasFilters = advanceFilter.some(
    item => item.filters && item.filters.length > 0,
  )

  const resolveRest = {
    ...rest,
    id: ulid(),
    values:
      rest?.field === 'raw_phone_number'
        ? [rest?.values?.[0]?.replace(/[^\d]/g, '')]
        : [rest?.values?.[0]],
    display_value: rest?.values?.[0],
    operator: rest?.operator === 'like' ? 'equal' : rest?.operator,
    default: false,
  }
  if (hasFilters) {
    const searchItemResolver = advanceFilter.map((item : any) => {
      if (item.filters) {
        return {
          ...item,
          filters: [
            ...item.filters,
            { type: "operator", operator: "and", entity: rest?.entity, default: false },
            resolveRest, // Corrected this part
          ],
        };
      }
      return item; // Keep "operator" objects unchanged    
    }) as ISearchItem[]
    return searchItemResolver
  }

  
  // If `filters` key exists, preserve nested structure
  const searchItemResolver =  [
    ...advanceFilter,
    ...(advanceFilter.length ? [{ type: 'operator', operator: 'and', default : false }] : []),
    {
      ...resolveRest,
    },
  ] as ISearchItem[]

  return searchItemResolver
}
