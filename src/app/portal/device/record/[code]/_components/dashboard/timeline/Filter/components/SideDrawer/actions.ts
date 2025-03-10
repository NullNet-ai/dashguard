'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  try {
    const saveGridFilter = await api.timelineFilter.createTimelineFilter({type: 'filter', data})

    return saveGridFilter
  }
  catch (error) {
    console.log('%c Line:8 🍺 error', 'color:#ffcc00', error)
  }
}

export const updateGridFilter = async (data: any) => {
  const updateGridFilter = await api.timelineFilter.updateTimelineFilter({type: 'filter', data})

  return updateGridFilter
}

export const removeFilter = async (id: string) => {
  const url = await api.timelineFilter.removeTimelineFilter({
    id,
    type: 'filter'
  })
  return url
}

export const duplicateFilterTab = async (tab: Record<string, any>) => {
  return await api.timelineFilter.duplicateTimelineFilter(
    {data: tab, type: 'filter'},
  )
}
