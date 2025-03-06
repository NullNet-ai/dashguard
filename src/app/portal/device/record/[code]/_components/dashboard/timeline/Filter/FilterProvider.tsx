'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

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
        id: 'Between',
        label: 'Between',
      },
      {
        id: 'Source Port',
        label: 'Source Port',
      },
      {
        id: 'Source Port',
        label: 'Source Port',
      },
      {
        id: 'Source Port Less than',
        label: 'Source Port Less than',
      },
      {
        id: 'New Filter',
        label: 'New Filter',
      },
      {
        id: 'New Filtersss',
        label: 'New Filtersss',
      },
      {
        id: 'New Filter',
        label: 'New Filter',
      },
    ]
  )

  const [query, setQuery] = useState('')

  const addFilter = (filter: string) => {
    setFilters(prev => [...prev, filter])
  }

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
