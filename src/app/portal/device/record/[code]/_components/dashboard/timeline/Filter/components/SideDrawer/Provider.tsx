'use client'

import React, { createContext, useContext, useState } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { useEventEmitter } from '~/context/EventEmitterProvider'

import { saveGridFilter, updateGridFilter } from './actions'
import { usePathname } from 'next/navigation';

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

  const pathname = usePathname();
  console.log('%c Line:35 🌽 pathname', 'color:#f5ce50', pathname);

  const [filterDetails, setFilterDetails] = useState<any>({
    ...tab,
    columns,
  })

  console.log('%c Line:38 🍑', 'color:#f5ce50', {
    ...tab,
    columns,
  });
  const [createFilterLoading, setCreateFilterLoading] = useState(false)
  const [updateFilterLoading, setUpdateFilterLoading] = useState(false)

  const convertArrayToString = (data: Record<string, any>[]) => {
    return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object'
      ? data.map((obj: any) => obj.value)
      : data
  }

  const handleUpdateFilter = (data: any) => {
    setFilterDetails({
      ...filterDetails,
      ...data,
    })
  }

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true)
    const saveFilter = await saveGridFilter(filterDetails)

    setCreateFilterLoading(false)
    return saveFilter
  }

  const saveUpdatedFilter = async () => {
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
            values: convertArrayToString(item.values),

          }
        }
        return item
      }),
      sorts: sorting,
      default_sorts: sorting,
    }
    setUpdateFilterLoading(true)
    eventEmitter.emit(`timeline_manage_filter`, { modifyFilterDetails })
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
            values: convertArrayToString(item.values),
          }
        }
        return item
      }),
      sorts: sorting,
      default_sorts: sorting,
    }
    setCreateFilterLoading(true)

    const filter_id = await saveGridFilter(modifyFilterDetails)
    eventEmitter.emit(`timeline_manage_filter`, { modifyFilterDetails: { ...modifyFilterDetails, id: filter_id } })
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
