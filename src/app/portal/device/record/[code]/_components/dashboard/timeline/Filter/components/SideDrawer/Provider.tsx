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
    errors: Record<string, any>
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
  
  const { actions } = useSideDrawer()
  const eventEmitter = useEventEmitter()
  const { closeSideDrawer } = actions ?? {}

  const pathname = usePathname();
  

  const [filterDetails, setFilterDetails] = useState<any>({
    ...tab,
    columns,
  })


  const [createFilterLoading, setCreateFilterLoading] = useState(false)
  const [updateFilterLoading, setUpdateFilterLoading] = useState(false)
  const [errors, setErrors] = useState({})
  

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


  function validateCriteria(data: any) {
    const required_fields = ["Time Range", "Resolution", "Graph Type"];
    let errors: any = {};

    data.forEach((item: any, index: number) => {
        if (item.hasOwnProperty("field") && !item.field) {
            errors[`filters.${index}.field`] = "This field is required.";
        }
        if (item.hasOwnProperty("operator") && !item.operator) {
            errors[`filters.${index}.operator`] = "This field is required.";
        }
        if( required_fields.includes(item.field)){
          if (item.hasOwnProperty("values") && !item?.[item.field]) {
            errors[`filters.${index}.${item.field}`] = "This field is required.";
          }
        }else if (item.hasOwnProperty("values") && Array.isArray(item.values) && item.values.length === 0) {
            errors[`filters.${index}.values`] = "This field is required.";
        }
    });

    return Object.keys(errors).length > 0 ? errors : null;
}

  const handleSaveFilter = async () => {
    setCreateFilterLoading(true)
    const saveFilter = await saveGridFilter(filterDetails, filter_type)

    setCreateFilterLoading(false)
    return saveFilter
  }

  const saveUpdatedFilter = async () => {
    
    const validateCriteriaErrors = validateCriteria(filterDetails.default_filter)
      if(validateCriteriaErrors) {
        setErrors(validateCriteriaErrors)
        return
      }
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

  
  const handleCreateNewFilter = async () => {
    const validateCriteriaErrors = validateCriteria(filterDetails.default_filter)
    if(validateCriteriaErrors) {
      setErrors(validateCriteriaErrors)
      return
    }
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
          errors
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
