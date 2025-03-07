'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  try {
    const saveGridFilter = await api.gridFilter.createGridFilter(data)

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🍺 error', 'color:#ffcc00', error)
  }
}

export const updateGridFilter = async (data: any) => {
  const updateGridFilter = await api.gridFilter.updateGridFilter(data)

  return updateGridFilter
}

export const removeFilter = async (id: string) => {
  const url = await api.gridFilter.removeFilter({
    id,
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>) => {
  return await api.gridFilter.duplicateGridFilter(
    tab,
  )
}

export const fetchTabFilter = async () => {
  try {
    const cacheData = await api.gridFilter.fetchGridFilter()

    const transformCachedData = cacheData.map((data: any) => {
      return {
        ...data,
        id: data.id,
        label: data.name,
      }
    }
    )
    return transformCachedData
  }
  catch (error) {
    console.log('%c Line:41 🧀 error', 'color:#7f2b82', error)
  }
}
