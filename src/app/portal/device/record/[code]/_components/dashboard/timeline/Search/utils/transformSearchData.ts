import { ulid } from 'ulid'

import { formatAndCapitalize } from '~/lib/utils'

import { type ISearchableField } from '../types'

const findTextInValue = (value: unknown, searchText: string, operator: string) => {
  // if (['contains', 'like', 'equal'].includes(operator)) {
    if (typeof value === 'string') {
      return value.toLowerCase() == searchText.toLowerCase() ? value : null
    }
    else if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      return value.find(v => v.toLowerCase() == searchText.toLowerCase()) || null
    }
  // }
  return value === searchText ? value : null
}

export const transformSearchData = (
  items: Record<string, any>[] | undefined,
  searchText: string,
  searchableFields: ISearchableField[],
) => {
  if (!items) return null

  const transformedData = items.reduce((acc: any, obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      const searchableField = searchableFields.find(
        field => field.accessorKey === key,
      )
      const foundValue = findTextInValue(value, searchText, searchableField?.operator ?? 'like')
   
      if (foundValue && searchableField) {
        acc.push({
          id: ulid(),
          values: [foundValue],
          operator: searchableField?.operator || 'equal',
          type: 'criteria',
          ...searchableField,
          label: searchableField?.label || formatAndCapitalize(key),
        })
      }
    }
    return acc
  }, [])
  const consolidated: Record<string, any> = {}
  transformedData.forEach((result: any) => {
    const key = `${result.field}_${JSON.stringify(result.values)}_${result.entity}`
    if (!consolidated[key]) {
      consolidated[key] = { ...result, count: 1 }
    }
    else {
      consolidated[key].count++
    }
  })
  const searchResults = Object.values(consolidated) || null
  console.log('%c Line:58 🥝 searchResults', 'color:#3f7cff', searchResults)
  return searchResults
}
