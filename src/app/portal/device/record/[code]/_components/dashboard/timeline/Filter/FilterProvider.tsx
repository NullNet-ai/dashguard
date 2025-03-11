'use client'
import { createContext, useContext, useState, useEffect } from 'react'

import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type IAction, type IProps, type IFilterContext, type IState, type IData, IFilter, type SearchItem } from '../types'

import {  removeFilter } from './components/SideDrawer/actions'
import { ulid } from 'ulid'

export const FilterContext = createContext<IFilterContext>({})

export const useFilter = (): IFilterContext => {
  const context = useContext(FilterContext)
  if (!context) {
    console.warn('use Filter must be used within a FilterProvider')
  }

  return context
}

const FilterProvider = ({ children }: IProps) => {
  const eventEmitter = useEventEmitter()

  const [filters, setFilters] = useState<Record<string, any>[]>(
    [
      {
        id: '01JNQ9WPA2JWNTC27YCTCYC1FE',
        name: 'All Data',
        label: 'All Data',
        default_filter: [],
      },
    ]
  )

  const {
    data: cached_filter_items = [],
    refetch: refetchFilters,
  } = api.timelineFilter.fetchTimelineFilter.useQuery({
    type: 'filter',
  })

  const [_refetchTrigger, _setRefetchTrigger] = useState(0)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  const [filterQuery, setFilterQuery] = useState<Record<string, any>>({})

  const fetchDetails = async (data: IData) => {
    const { modifyFilterDetails: filter } = data || {}
    setFilters((prev) => {
      const updatedFilters = new Map(prev.map(item => [item.id, item]))
      updatedFilters.set(filter?.id, { ...updatedFilters.get(filter?.id), ...filter, label: filter?.name || '', default_filter: (filter?.default_filter?.map((_filter: Record<string, any>) => {
        if (_filter?.type === 'criteria') {
          return {
            ..._filter,
            values: _filter?.values?.map((value: SearchItem) => ({
              label: value,
              value: value,
            })),
          }
        }
        return _filter
      })) as Record<string, any>[],
      })
      return [...updatedFilters.values()]
    })
  }

  useEffect(() => {
    eventEmitter.emit(`filter_id`, filterQuery)
  }, [_refetchTrigger, filterQuery])

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`manage_filter`, fetchDetails)
    return () => {
      eventEmitter.off(`manage_filter`, fetchDetails)
    }
  }, [eventEmitter, JSON.stringify(filters)])

  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!cached_filter_items?.length) return
    const fetchFilter = async () => { // Refactor this function
      setFilters((prev) => {
        // Convert previous filters to a Map
        const updatedFilters = new Map(prev.map(item => [item.id, item]));

        (cached_filter_items || []).forEach((item: any) => {
          const label = item?.name || item?.label

          // Merge with existing item or add new one
          updatedFilters.set(item.id, {
            ...updatedFilters.get(item.id),
            ...item,
            label,
            default_filter: item.default_filter.map((filter: any) => {
              if (filter.type === 'criteria') {
                return {
                  ...filter,
                  values: filter.values.map((value: string) => ({
                    label: value,
                    value,
                  })),
                }
              }
            }),
          })
        })

        return [...updatedFilters.values()]
      })
    }

    fetchFilter()
  }, [cached_filter_items?.length])

  const handleOnChange = (e: any) => {
    setQuery(e)
  }

  const handleDelete = async ({ id }: { id: string }) => {
    setFilters(prev => prev.filter(item => item.id !== id))
    await removeFilter(id)
  }
  
  
  const { mutate: duplicateFilter } = api.timelineFilter.duplicateTimelineFilter.useMutation()
  const handleDuplicateTab = (tab: Record<string, any>) => {
    duplicateFilter({ type: 'filter', data: tab })
    // setRefetchTrigger((prev) => prev + 1)
  }

  const state = {
    filters,
    query,
    filterQuery: filterQuery || {},
    setFilterQuery,
    _refetchTrigger,
    _setRefetchTrigger,
  } as IState

  const actions = {
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
