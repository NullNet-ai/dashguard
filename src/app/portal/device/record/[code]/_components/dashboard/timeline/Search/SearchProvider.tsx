'use client'
import { createContext, useContext, useState } from 'react'

import { type IAction, type IProps, type ISearchContext, type IState } from '../types'

export const SearchContext = createContext<ISearchContext>({})

export const useSearch = (): ISearchContext => {
  const context = useContext(SearchContext)
  if (!context) {
    // throw new Error("use Wizard must be used within a WizardProvider");
    console.warn('use Search must be used within a SearchProvider')
  }

  return context
}

const SearchProvider = ({ children }: IProps) => {
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
    <SearchContext.Provider value={{ state, actions }}>
      {children}
    </SearchContext.Provider>
  )
}

export default SearchProvider
