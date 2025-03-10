'use client'

import React, { createContext, useContext, useState } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { useEventEmitter } from '~/context/EventEmitterProvider'

import { saveGridFilter, updateGridFilter } from './actions'
import { valHooks } from 'node_modules/cypress/types/jquery';

interface ManageFilterContextType {
  state: {
    tab_props: any
    filterDetails: any
    columns: Record<string, any>[]
    createFilterLoading: boolean
    updateFilterLoading: boolean
  }
  actions: {
    handleUpdateFilter: (data: any) => void
    handleCreateNewFilter: () => void
    handleSaveFilter: () => void
    saveUpdatedFilter: () => void
  }
}

export const ManageFilterContext = createContext<ManageFilterContextType | undefined>(undefined)

export function ManageFilterProvider({ children, tab, columns }: { children: React.ReactNode, tab: any, columns: Record<string, any>[] }) {
  const { actions } = useSideDrawer()
  const eventEmitter = useEventEmitter()
  const { closeSideDrawer } = actions ?? {}

  const [filterDetails, setFilterDetails] = useState<any>({
    ...tab,
    columns,
  })
  console.log('%c Line:35 🥓 filterDetails', 'color:#ffdd4d', filterDetails);

  const [createFilterLoading, setCreateFilterLoading] = useState(false)
  const [updateFilterLoading, setUpdateFilterLoading] = useState(false)

  const handleUpdateFilter = (data: any) => {
    console.log('%c Line:42 🍭 data', 'color:#ea7e5c', data, filterDetails);
    setFilterDetails({
      ...filterDetails,
      ...data,
  //  default_filter:(
  //   data.default_filter || filterDetails.default_filter
  //  )?.map((item: any) => {
  //   if (item.type === 'criteria') {
  //     return {
  //       ...item,
  //       // Convert array of strings back to array of objects for display
  //       values: Array.isArray(item.values) && item.values.length > 0 && typeof item.values[0] === 'string'
  //         ? item.values.map((value: string) =>{
  //           return ({ value , label: value })})
  //         : item.values,
  //     }
  //   }
  //   return item
  //  })
    })
  }

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true)
    const saveFilter = await saveGridFilter(filterDetails)

    setCreateFilterLoading(false)
    return saveFilter
  }

  const saveUpdatedFilter = async () => {
    console.log("%c Line:58 🥟 filterDetails", "color:#fca650", filterDetails);
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map(
          (item: any) => {
            return {
              id: item.value || item.id,
              desc: item.desc,
            }
          }
        )
      : [{
          id: 'created_date',
          desc: true,
        }]

    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: filterDetails.default_filter.map((item: any) => {
        if (item.type === 'criteria') {
          return {
            ...item,
            // Convert array of objects back to array of strings for database
            values: Array.isArray(item.values) && item.values.length > 0 && typeof item.values[0] === 'object'
              ? item.values.map((obj: any) => obj.value)
              : item.values,
          }
        }
        return item
      }),
      sorts: sorting,
      default_sorts: sorting,
    }
    setUpdateFilterLoading(true)
    eventEmitter.emit(`manage_filter`, { modifyFilterDetails })
    console.log('%c Line:92 🍋 modifyFilterDetails', 'color:#f5ce50', modifyFilterDetails);
    await updateGridFilter(modifyFilterDetails)
    setUpdateFilterLoading(false)
    closeSideDrawer()
  }

  const handleCreateNewFilter = async () => {
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map(
          (item: any) => {
            return {
              id: item.value || item.id,
              desc: item.desc,
            }
          }
        )
      : [{
          id: 'created_date',
          desc: true,
        }]

    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: filterDetails.default_filter.map((item: any) => {
        if (item.type === 'criteria') {
          return {
            ...item,
            // Convert array of objects back to array of strings for database
            values: Array.isArray(item.values) && item.values.length > 0 && typeof item.values[0] === 'object'
              ? item.values.map((obj: any) => obj.value)
              : item.values,
          }
        }
        return item
      }),
      sorts: sorting,
      default_sorts: sorting,
    }
    setCreateFilterLoading(true)

    console.log('%c Line:149 🍿', 'color:#6ec1c2',modifyFilterDetails );
   const filter_id =  await saveGridFilter(modifyFilterDetails)
   console.log('%c Line:151 🥝 filter_id', 'color:#6ec1c2', filter_id);
    eventEmitter.emit(`manage_filter`, { modifyFilterDetails: { ...modifyFilterDetails, id: filter_id } })
    setCreateFilterLoading(false)
    closeSideDrawer()
  }

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns,
          createFilterLoading,
          updateFilterLoading,
        },
        actions: {
          handleUpdateFilter,
          handleCreateNewFilter,
          handleSaveFilter,
          saveUpdatedFilter,
        },
      }}
    >
      {children}
    </ManageFilterContext.Provider>
  )
}

export const useManageFilter = () => {
  const context = useContext(ManageFilterContext)
  if (!context) {
    throw new Error('useManageFilter must be used within ManageFilterProvider')
  }
  return context
}
