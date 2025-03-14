'use client'
import { createContext, useContext, useState, useEffect } from 'react'

import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

import { type IAction, type IProps, type IFilterContext, type IState, type IData, IFilter, type SearchItem } from '../types'

import {  removeFilter } from './components/SideDrawer/actions'
import { ulid } from 'ulid'
import { IFormProps } from '../../types'

export const FilterContext = createContext<IFilterContext>({})

export const useFilter = (): IFilterContext => {
  const context = useContext(FilterContext)
  if (!context) {
    console.warn('use Filter must be used within a FilterProvider')
  }

  return context
}

const FilterProvider = ({ children, params, type }: any) => {
  console.log('%c Line:25 🥒 type', 'color:#465975', type);
  const eventEmitter = useEventEmitter()
  const {router, resolver} = params || {}

  const [filters, setFilters] = useState<Record<string, any>[]>(
    [
      {
        id: '01JNQ9WPA2JWNTC27YCTCYC1FE',
        name: '1 Day',
        label: '1 Day',
        default_filter: [],
      },
    ]
  )

  console.log('%c Line:44 🍒 type', 'color:#ed9ec7', type);
  const {
    data: cached_filter_items = [],
  } = api.cachedFilter.fetchCachedFilter.useQuery({
    type: type,
  })

  const [_refetchTrigger, _setRefetchTrigger] = useState(0)
  const [filterQuery, setFilterQuery] = useState<Record<string, any>>({})

  const fetchDetails = async (data: IData) => {
    console.log('%c Line:50 🌮 data', 'color:#ffdd4d', data);
    if (!data?.modifyFilterDetails || !data?.modifyFilterDetails?.id) return;
    console.log('%c Line:50 🌽 data', 'color:#6ec1c2', data);
    
    setFilters((prev) => {
      const updatedFilters = new Map(prev.map(item => [item.id, item]));
      const { id, name, default_filter, ...rest } = data.modifyFilterDetails;
  
      updatedFilters.set(id, {
        ...updatedFilters.get(id),
        ...rest,
        id,
        label: name || '',
        default_filter: default_filter?.map((f) =>
          f.type === 'criteria'
            ? { ...f, values: f.values?.map((v: SearchItem) => ({ label: v, value: v })) }
            : f
        ),
      });
      console.log('%c Line:69 🎂 updatedFilters.values()', 'color:#7f2b82', updatedFilters.values());
  
      return [...updatedFilters.values()];
    });
  };
  

  console.log('%c Line:71 🌰', 'color:#e41a6a', filterQuery);
  useEffect(() => {

    eventEmitter.emit(`${type}_id`, filterQuery)
    console.log('%c Line:81 🎂 filterQuery', 'color:#7f2b82', filterQuery);
  }, [_refetchTrigger, filterQuery])

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`${type}_manage_filter`, fetchDetails)
    return () => {
      eventEmitter.off(`${type}_manage_filter`, fetchDetails)
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
    await removeFilter(id, type)
  }
  
  
  const duplicateFilter= api.cachedFilter.duplicateFilter.useMutation()
  const handleDuplicateTab = async (tab: Record<string, any>) => {
    const response: Record<string,any> = await duplicateFilter.mutateAsync({ type: type, data: tab })
    setFilters(prev => {
      return [...prev, response]})
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
