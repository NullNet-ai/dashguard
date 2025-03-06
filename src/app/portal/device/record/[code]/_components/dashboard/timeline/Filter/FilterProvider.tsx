'use client'
import { createContext, useContext, useState } from 'react'

import { type IAction, type IProps, type IFilterContext, type IState } from '../types'

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
  const [filters, setFilters] = useState([
    {
      id: 'all_data',
      label: 'All Data',
      // content: <FilterContent />,
    },
    {
      id: 'source_ip',
      label: 'Source IP',
      // content: <SortContent />,
    },
    {
      id: 'philippines',
      label: 'Philippines',
      // content: <GroupContent />,
    },
  ])

  const [query, setQuery] = useState('')

  const addFilter = (filter: string) => {
    setFilters(prev => [...prev, filter])
  }

  const handleOnChange = (e: any) => {
    setQuery(e)
  }
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
