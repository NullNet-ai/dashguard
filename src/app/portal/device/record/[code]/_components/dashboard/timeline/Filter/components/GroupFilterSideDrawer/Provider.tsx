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
  existingFilters = [],
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
  existingFilters?: Record<string, any>[]
}) {
  const { actions } = useSideDrawer()
  const router = useRouter()
  const { closeSideDrawer } = actions ?? {}
  const [filterDetails, setFilterDetails] = useState<any>({
    ...tab,
    columns,
  })
  
  const [createFilterLoading, setCreateFilterLoading] = useState(false)
  const [updateFilterLoading, setUpdateFilterLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const eventEmitter = useEventEmitter()
  const handleUpdateFilter = (data: any) => {
    setFilterDetails({
      ...filterDetails,
      ...data
    });
    if ('name' in data) {
      setErrors((prev: any) => { const { name: _, ...rest } = prev; return rest })
    }
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
          if (item.hasOwnProperty('values')) {
            if (item?.[item.field] && item?.[item.field].slice(1, 2)) {
            } else {
              errors[`filterGroups.${groupIndex}.filters.${index}.${item.field}`] = 'This field is required.'
            }
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
    const updatedName = filterDetails?.name?.trim()?.toLowerCase()
    if (!updatedName) {
      setErrors({ name: 'Filter name is required.' })
      return
    }
    const isDuplicateName = existingFilters.some(
      (f) => f.name?.trim()?.toLowerCase() === updatedName && f.id !== filterDetails.id
    )
    if (isDuplicateName) {
      setErrors({ name: 'A filter with this name already exists.' })
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
    const {href} = await updateGridFilter(modifyFilterDetails, filter_type)
    eventEmitter.emit('should_refresh_timeline_filter', true)
    setUpdateFilterLoading(false)
    closeSideDrawer()
    router.push(href)
    router.refresh()
  }

  const handleCreateNewFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.filterGroups)
    console.log("🚀 ~ handleCreateNewFilter ~ validateCriteriaErrors:", validateCriteriaErrors)
    if (validateCriteriaErrors) {
      setErrors(validateCriteriaErrors)
      return
    }
    const newName = filterDetails?.name?.trim()?.toLowerCase()
    if (!newName) {
      setErrors({ name: 'Filter name is required.' })
      return
    }
    const isDuplicateName = existingFilters.some(
      (f) => f.name?.trim()?.toLowerCase() === newName
    )
    if (isDuplicateName) {
      setErrors({ name: 'A filter with this name already exists.' })
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
    const {id: filter_id, href} = await saveGridFilter(modifyFilterDetails, filter_type) as { id: string, href: string }
    eventEmitter.emit(`${filter_type}_manage_filter`, { modifyFilterDetails: { ...modifyFilterDetails, id: filter_id } })
    eventEmitter.emit('timeline_filter_id', filter_id)
    eventEmitter.emit('traffic_graph_filter_id', filter_id)

    setCreateFilterLoading(false)
    closeSideDrawer()
    router.push(href)
    router.refresh()
  }

  return (
    <ManageFilterContext.Provider
      value={{
        state: {
          tab_props: tab,
          filterDetails,
          columns: filter_type === 'map_filter' ? [
            {
              header: 'Source Country',
              label: 'Source Country',
              accessorKey: 'source_country.country',
              custom: true,
            },
            {
              header: 'Destination Country',
              label: 'Destination Country',
              accessorKey: 'destination_country.country',
              custom: true,
            },
          ]: columns,
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
