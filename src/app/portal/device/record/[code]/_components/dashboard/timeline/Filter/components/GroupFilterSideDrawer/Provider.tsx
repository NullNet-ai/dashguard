'use client'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useState } from 'react'

import { type AppRouterKeys } from '~/components/platform/Grid/types'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { useEventEmitter } from '~/context/EventEmitterProvider'

import { type ISearchParams } from '../../../Search/types'

import { saveGridFilter, transformFilterGroups, updateGridFilter } from './actions'

interface ManageFilterContextType {
  state: {
    tab_props: any
    filterDetails: any
    columns: Record<string, any>[]
    createFilterLoading: boolean
    updateFilterLoading: boolean
    searchConfig: any
    errors: Record<string, any>
  }
  actions: {
    handleUpdateFilter: (data: any) => void
    handleCreateNewFilter: () => void
    handleSaveFilter: () => void
    saveUpdatedFilter: () => void
  }
}

const ManageFilterContext = createContext<ManageFilterContextType | undefined>(
  undefined,
)

export function ManageFilterProvider({
  children,
  tab,
  columns,
  searchConfig,
  filter_type,
}: {
  children: React.ReactNode
  tab: any
  columns: Record<string, any>[]
  searchConfig?: {
    router?: AppRouterKeys
    resolver?: string
    query_params?: ISearchParams
  }
  errors?: Record<string, any>
  filter_type: string
}) {
  const { actions } = useSideDrawer()
  const router = useRouter()
  const { closeSideDrawer } = actions ?? {}
  const [filterDetails, setFilterDetails] = useState<any>({
    ...tab,
    columns,
  })
  console.log('%c Line:55 🥕 filterDetails', 'color:#33a5ff', filterDetails)
  const [createFilterLoading, setCreateFilterLoading] = useState(false)
  const [updateFilterLoading, setUpdateFilterLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const eventEmitter = useEventEmitter()
  const handleUpdateFilter = (data: any) => {
  //   const getUniqueFilterGroups = (data: any) => {
  //     const uniqueIds = new Set();
  //     return {
  //         filterGroups: data.filterGroups.filter((group: any) => {
  //             if (!uniqueIds.has(group.id)) {
  //                 uniqueIds.add(group.id);
  //                 return true;
  //             }
  //             return false;
  //         })
  //     };
  // }
    setFilterDetails({
      ...filterDetails,
      // ...(data?.filterGroups?
      //   getUniqueFilterGroups(data): data),
      ...data
    });
  };

 

  function validateCriteria(data: any) {
    const required_fields = ['Time Range', 'Resolution', 'Graph Type']
    const errors: any = {}

    data?.forEach((item: any, groupIndex: number) => {
      item?.filters?.forEach((item: any, index: number) => {
        if (item.hasOwnProperty('field') && !item.field) {
          errors[`filterGroups.${groupIndex}.filters.${index}.field`] = 'This field is required.'
        }
        if (item.hasOwnProperty('operator') && !item.operator) {
          errors[`filterGroups.${groupIndex}.filters.${index}.field`] = 'This field is required.'
        }
        if (required_fields.includes(item.field)) {
          if (item.hasOwnProperty('values') && !item?.[item.field]) {
            errors[`filterGroups.${groupIndex}.filters.${index}.${item.field}`] = 'This field is required.'
          }
        }
        else if (item.hasOwnProperty('values') && Array.isArray(item.values) && item.values.length === 0) {
          errors[`filterGroups.${groupIndex}.filters.${index}.values`] = 'This field is required.'
        }
      })
    })

    return Object.keys(errors).length > 0 ? errors : null
  }

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true)
    const saveFilter = await saveGridFilter(filterDetails, filter_type)

    setCreateFilterLoading(false)
    return saveFilter
  }

  const saveUpdatedFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.filterGroups)
    if (validateCriteriaErrors) {
      setErrors(validateCriteriaErrors)
      return
    }
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          }
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ]

    const rawFilterGroup = JSON.parse(
      JSON.stringify(filterDetails?.filterGroups),
    ) // Deep copy to prevent modifications
    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns)
    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: resolveDefaultFilter,
      sorts: sorting,
      filterGroups: rawFilterGroup,
      default_sorts: sorting,
      group_advance_filters: resolveGroupFilter,
    }

    setUpdateFilterLoading(true)
    eventEmitter.emit(`${filter_type}_manage_filter`, { modifyFilterDetails })
    await updateGridFilter(modifyFilterDetails, filter_type)
    setUpdateFilterLoading(false)
    closeSideDrawer()
    router.refresh()
  }

  const handleCreateNewFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.filterGroups)
    if (validateCriteriaErrors) {
      setErrors(validateCriteriaErrors)
      return
    }
    const sorting = filterDetails?.sorts?.length
      ? filterDetails.sorts.map((item: any) => {
          return {
            id: item.value || item.id,
            desc: item.desc,
          }
        })
      : [
          {
            id: 'created_date',
            desc: true,
          },
        ]

    const rawFilterGroup = JSON?.parse(
      JSON.stringify(filterDetails?.filterGroups),
    ) // Deep copy to prevent modifications

    const { resolveDefaultFilter, resolveGroupFilter } = await transformFilterGroups(filterDetails, columns)

    const modifyFilterDetails = {
      ...filterDetails,
      default_filter: !resolveDefaultFilter?.length ? filterDetails?.default_filter : resolveDefaultFilter,
      sorts: sorting,
      default_sorts: sorting,
      filterGroups: rawFilterGroup,
      group_advance_filters: resolveGroupFilter,
    }
    setCreateFilterLoading(true)
    const filter_id = await saveGridFilter(modifyFilterDetails, filter_type)
    eventEmitter.emit(`${filter_type}_manage_filter`, { modifyFilterDetails: { ...modifyFilterDetails, id: filter_id } })

    setCreateFilterLoading(false)
    closeSideDrawer()
    router.refresh()
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
          searchConfig,
          errors: errors || {},
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
