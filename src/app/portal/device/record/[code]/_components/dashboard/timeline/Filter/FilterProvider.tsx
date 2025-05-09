'use client'
import { createContext, useContext, useState, useEffect } from 'react'

import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type IAction, type IProps, type IFilterContext, type IState, type IData, IFilter, type SearchItem } from '../types'

import { removeFilter } from './components/FilterSideDrawer/actions'

export const FilterContext = createContext<IFilterContext>({})

export const useFilter = (): IFilterContext => {
  const context = useContext(FilterContext)
  if (!context) {
    console.warn('use Filter must be used within a FilterProvider')
  }

  return context
}

const FilterProvider = ({ children, params, type }: any) => {
  const eventEmitter = useEventEmitter()
  const { router, resolver } = params || {}
  const [shouldRefresh, setShouldRefresh] = useState(false)

  const [filters, setFilters] = useState<Record<string, any>[]>(
    [
      {
        id: '01JNQ9WPA2JWNTC27YCTCYC1FE',
        name: 'Live Data',
        label: 'Live Data',
        default_filter: [],
      },
    ]
  )

  const {
    data: cached_filter_items = [],
  } = api.cachedFilter.fetchCachedFilter.useQuery({
    type,
  })

  const [_refetchTrigger, _setRefetchTrigger] = useState(0)
  const [filterQuery, setFilterQuery] = useState<Record<string, any>>({})

  const fetchDetails = async (data: IData) => {
    if (!data?.modifyFilterDetails?.id) return

    setFilters((prev) => {
      const updatedFilters = new Map(prev.map(item => [item.id, item]))
      const { id, name, default_filter, ...rest } = data.modifyFilterDetails

      updatedFilters.set(id, {
        ...updatedFilters.get(id),
        ...rest,
        id,
        name: name || '',
        label: name || '',
        default_filter: default_filter?.map(f => f.type === 'criteria'
          ? { ...f, values: f.values?.map((v: SearchItem) => ({ label: v, value: v })) }
          : f
        ),
      })
      setShouldRefresh(prev => !prev)

      return [...updatedFilters.values()]
    })
  }

  useEffect(() => {
    eventEmitter.emit(`${type}_id`, filterQuery)
  }, [_refetchTrigger, filterQuery])

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`${type}_manage_filter`, fetchDetails)
    return () => {
      eventEmitter.off(`${type}_manage_filter`, fetchDetails)
    }
  }, [eventEmitter, JSON.stringify(filters), filterQuery])

  useEffect(() => {
    if (!eventEmitter || shouldRefresh === undefined) return;
  
    const handleRefresh = () => {
      return shouldRefresh;
    };

    eventEmitter.emit(`should_refresh_${type}`, shouldRefresh);
  
    return () => {
      eventEmitter.off(`should_refresh_${type}`, handleRefresh);
    };
  }, [shouldRefresh, eventEmitter]);

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
            default_filter: item?.filterGroups?.map((filter: any) => {
              if (filter?.type === 'criteria') {
                return {
                  ...filter,
                  values: filter.values.map((value: string) => ({
                    label: value,
                    value,
                  })),
                }
              }
              return filter
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
    await removeFilter(id, type)
  }

  const duplicateFilter = api.cachedFilter.duplicateFilter.useMutation()
  const handleDuplicateTab = async (tab: Record<string, any>) => {
    const response: Record<string, any> = await duplicateFilter.mutateAsync({ type, data: tab })
    setFilters((prev) => {
      return [...prev, response]
    })
  }

  const state = {
    filters,
    query,
    filterQuery: filterQuery || {},
    setFilterQuery,
    _refetchTrigger,
    _setRefetchTrigger,
    filter_type: type,
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
