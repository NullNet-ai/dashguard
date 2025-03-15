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

export function ManageFilterProvider({ children, tab, columns, filter_type }: { children: React.ReactNode, tab: any, columns: Record<string, any>[], filter_type: string }) {
  console.log('%c Line:30 🎂 filter_type', 'color:#42b983', filter_type);
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
    const saveFilter = await saveGridFilter(filterDetails, filter_type)

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
        console.log('%c Line:102 🥥 filter_type', 'color:#465975', filter_type);

        console.log('%c Line:89 🍧 filterDetails', 'color:#ed9ec7', filterDetails);
    const modifyFilterDetails = {
      ...filterDetails,
      label: filterDetails?.name || '',
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
    eventEmitter.emit(`${filter_type}_manage_filter`, { modifyFilterDetails })
    await updateGridFilter(modifyFilterDetails, filter_type)
    setUpdateFilterLoading(false)
    closeSideDrawer()
  }

  console.log('%c Line:141 🍌 filter_type', 'color:#ffdd4d', filter_type);
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

    const filter_id = await saveGridFilter(modifyFilterDetails,  filter_type)
    eventEmitter.emit(`${filter_type}_manage_filter`, { modifyFilterDetails: { ...modifyFilterDetails, id: filter_id } })

    console.log('%c Line:142 🍤', 'color:#ed9ec7');
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
