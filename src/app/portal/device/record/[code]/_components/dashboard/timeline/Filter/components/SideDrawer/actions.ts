'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  const saveGridFilter = await api.gridFilter.createGridFilter(data)

  return saveGridFilter
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
