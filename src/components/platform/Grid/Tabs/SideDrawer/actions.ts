'use server'
import { api } from '~/trpc/server'

export const saveGridFilter = async (data : any)  => {
  const saveGridFilter = await api.gridFilter.createGridFilter(data).catch((e) => {
    console.log("ERRRRROR SAVE GRID FILTERRR", e)
    return null;
  });
  console.log("🚀 ~ saveGridFilter ~ saveGridFilter:", saveGridFilter)
  
  return saveGridFilter;
}