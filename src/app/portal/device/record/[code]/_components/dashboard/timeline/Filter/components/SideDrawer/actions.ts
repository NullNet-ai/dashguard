'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data: any) => {
  try {
    console.log('%c Line:5 🍒 data', 'color:#33a5ff', data);
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

    console.log('%c Line:37 🥝', 'color:#ea7e5c');
    const cacheData = await api.gridFilter.fetchGridFilter()
    console.log('%c Line:37 🍣 cacheData', 'color:#93c0a4', cacheData);

    const transformCachedData = cacheData.map((data: any) => {
      console.log("%c Line:39 🍌 data", "color:#ed9ec7", data);
      return {
        ...data,
        id: data.id,
        label: data.name,
        default_filter: data.default_filter.map((filter: any) => {
          if (filter.type === 'criteria') {
            return {
              ...filter,
              values: filter.values.map((value: string) => ({
                label: value,
                value: value,
              })),
            };
          }
          return filter;
        }),
      };
  })
    return transformCachedData
  }
  catch (error) {
    console.log('%c Line:41 🧀 error', 'color:#7f2b82', error)
  }
}
