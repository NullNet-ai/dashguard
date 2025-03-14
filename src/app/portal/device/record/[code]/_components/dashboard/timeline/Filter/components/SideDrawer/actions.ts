'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  try {
    const saveGridFilter = await api.cachedFilter.createFilter({type: 'filter', data})

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🍺 error', 'color:#ffcc00', error)
  }
}

export const updateGridFilter = async (data: any) => {
  const updateGridFilter = await api.cachedFilter.updateFilter({ type: 'filter', data})

  return updateGridFilter
}

export const removeFilter = async (id: string) => {
  const url = await api.cachedFilter.removeFilter({
    id,
    type: 'filter'
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>) => {
  return await api.cachedFilter.duplicateFilter(
    {data: tab, type: 'filter'},
  )
}
