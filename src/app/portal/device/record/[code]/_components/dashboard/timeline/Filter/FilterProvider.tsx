'use client'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, useEffect } from 'react'

import { useEventEmitter } from '~/context/EventEmitterProvider'

import { type IAction, type IProps, type IFilterContext, type IState } from '../types'

import { duplicateFilterTab, fetchTabFilter, removeFilter } from './components/SideDrawer/actions'

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
  const pathName = usePathname()
  const baseUrl = `${pathName}?current_tab=dashboard&sub_tab=timeline`

  const eventEmitter = useEventEmitter()
  const [filters, setFilters] = useState(
    [
      {
        id: '01JNQ9WPA2JWNTC27YCTCYC1FE',
        name: 'All Data',
        label: 'All Data',
        href: `${baseUrl}&sub_tab=all_data`,
      },
    ]
  )
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const fetchDetails = async (data: any) => {
    setRefetchTrigger(prev => prev + 1)
  }

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`manage_filter`, fetchDetails)
    return () => {
      eventEmitter.off(`manage_filter`, fetchDetails)
    }
  }, [eventEmitter])

  const [query, setQuery] = useState('')

  const addFilter = (filter: string) => {
    setFilters(prev => [...prev, filter])
  }

  useEffect(() => {
    const fetchFilter = async () => {
      const result = await fetchTabFilter() ?? []

      setFilters((prev) => {
        const updatedFilters = new Map(prev.map(item => [item.id, item])) // Convert previous filters to a Map

        result.forEach((item: any) => {
            const formattedName = item.label.toLowerCase().replace(/\s+/g, '_')
            const href = `${baseUrl}&sub_tab=${formattedName}`
            if (updatedFilters.has(item.id)) {
            
            updatedFilters.set(item.id, { ...updatedFilters.get(item.id), ...item, href  }) // Merge updates
          }
          else {
            updatedFilters.set(item.id, {...item, href }) // Add new item
          }
        })

        return Array.from(updatedFilters.values()) // Convert Map back to an array
      })
    }

    fetchFilter()
  }, [refetchTrigger])

  const handleOnChange = (e: any) => {
    setQuery(e)
  }

  const handleDelete = async ({ id }: { id: string }) => {
    setRefetchTrigger(prev => prev + 1)
    setFilters(prev => prev.filter(item => item.id !== id))
    await removeFilter(id)
  }

  const handleDuplicateTab = async (tab: Record<string, any>) => {
    await duplicateFilterTab(tab)
    setRefetchTrigger(prev => prev + 1)
  }

  const state = {
    filters,
    query,

  } as IState

  const actions = {
    addFilter,
    handleOnChange,
    handleDelete,
    handleDuplicateTab,
  } as IAction

  return (
    <FilterContext.Provider value={{ state, actions }}>
      {children}
    </FilterContext.Provider>
  )
}

export default FilterProvider
