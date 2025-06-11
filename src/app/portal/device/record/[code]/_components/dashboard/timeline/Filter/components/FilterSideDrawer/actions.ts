'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any, filter_type: string) => {
  try {
    const saveGridFilter = await api.cachedFilter.createFilter({type: filter_type, data})

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🍺 error', 'color:#ffcc00', error)
  }
}

export const updateGridFilter = async (data: any,  filter_type: string) => {
  const updateGridFilter = await api.cachedFilter.updateFilter({ type: filter_type, data})

  return updateGridFilter
}

export const removeFilter = async (id: string,  filter_type: string) => {
  const url = await api.cachedFilter.removeFilter({
    id,
    type: filter_type
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>,  filter_type: string) => {
  return await api.cachedFilter.duplicateFilter(
    {data: tab, type: filter_type},
  )
}
