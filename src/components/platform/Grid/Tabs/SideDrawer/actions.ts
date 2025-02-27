'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data : any)  => {
  try {
    const saveGridFilter = await api.gridFilter.createGridFilter(data)

    return saveGridFilter
  } catch (error) {
    console.log("error", error)
  }
}