'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ulid } from 'ulid'

import { api } from '~/trpc/server'

import { type IAction, type IProps, type IFilterContext, type IState } from '../types'

import { fetchTabFilter } from './components/SideDrawer/actions'
import { useManageFilter } from './components/SideDrawer/Provider'

export const FilterContext = createContext<IFilterContext>({})

export const useFilter = (): IFilterContext => {
  const context = useContext(FilterContext)
  if (!context) {
    // throw new Error("use Wizard must be used within a WizardProvider");
    console.warn('use Filter must be used within a FilterProvider')
  }

  return context
}

const FilterProvider = ({ children }: IProps) => {
  const form = useForm()
  console.log('%c Line:21 🍺 form', 'color:#2eafb0', { form, name })
  const [filters, setFilters] = useState(
    [
      {
        id: '01JNQ9WPA2JWNTC27YCTCYC1FE',
        label: 'All Data',
        href: `http://localhost:3000/portal/device/record/DV100013?current_tab=dashboard&sub_tab=timeline&sub_tab=all_data`,
      },
    ]
  )

  const [query, setQuery] = useState('')

  const addFilter = (filter: string) => {
    setFilters(prev => [...prev, filter])
  }

  useEffect(() => {
    console.log('%c Line:39 🍺 filters', 'color:#2eafb0', filters)
    const fetchFilter = async () => {
      const result = await fetchTabFilter() ?? []
      console.log('%c Line:44 🍫 result', 'color:#3f7cff', result)
      setFilters(prev => [...prev, ...result])
    }
    fetchFilter()
  }, [])

  const handleOnChange = (e: any) => {
    setQuery(e)
  }
  console.log('%c Line:70 🥐 filters', 'color:#4fff4B', filters)
  const state = {
    filters,
    query,
  } as IState

  const actions = {
    addFilter,
    handleOnChange,
  } as IAction

  return (
    <FilterContext.Provider value={{ state, actions }}>
      {children}
    </FilterContext.Provider>
  )
}

export default FilterProvider
