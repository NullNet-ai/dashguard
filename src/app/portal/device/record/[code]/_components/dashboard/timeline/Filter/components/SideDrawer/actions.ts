'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  try {
    console.log('%c Line:5 🥔 data', 'color:#465975', data)
    const saveGridFilter = await api.gridFilter.createGridFilter(data)

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🥤 error', 'color:#b03734', error)
  }
}

export const updateGridFilter = async (data: any) => {
  const updateGridFilter = await api.gridFilter.updateGridFilter(data)

  return updateGridFilter
}

export const removeGridFilter = async (id: string) => {
  const url = await api.gridFilter.removeGridFilter({
    id,
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>) => {
  const url = await api.gridFilter.duplicateGridFilter({
    tab,
  })

  return url
}

export const fetchTabFilter = async () => {
  try {
    const cacheData = await api.gridFilter.fetchGridFilter({})
    console.log('%c Line:39 🥑 cacheData', 'color:#7f2b82', cacheData)

    const transformCachedData = cacheData.map((data: any) => {
      return {
        id: data.name,
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
