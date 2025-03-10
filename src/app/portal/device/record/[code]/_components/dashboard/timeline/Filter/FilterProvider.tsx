'use client'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, useEffect } from 'react'

import { useEventEmitter } from '~/context/EventEmitterProvider'
import { api } from '~/trpc/react'

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
  // const queryFilters = api.gridFilter.fetchGridFilter.useQuery()
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
  

  const {
    data: cached_filter_items = [],
    refetch: refetchFilters,
  } = api.timelineFilter.fetchTimelineFilter.useQuery({
    type: 'filter',
  })
  

  const [refetchTrigger, setRefetchTrigger] = useState(0)
  
  const [_refetchTrigger, _setRefetchTrigger] = useState(0)
  const [filterQuery, setFilterQuery] = useState()
  const [_filterQuery, _setFilterQuery] = useState()


  const fetchDetails = async (data: any) => {
    const {modifyFilterDetails: filter} = data || {}
    setFilters((prev) => {
      const updatedFilters = new Map(prev.map(item => [item.id, item]));
      updatedFilters.set(filter.id, { ...updatedFilters.get(filter.id), ...filter , label: filter.name, default_filter: filter.default_filter.map((_filter: any) => {
        if (_filter.type === 'criteria') {
          return {
            ..._filter,
            values: _filter.values.map((value: string) => ({
              label: value,
              value: value,
            })),
          };
        }
        return _filter;
      }) });
      return [...updatedFilters.values()];
    });
  };
  

  useEffect(() => {
    console.log('%c Line:69 🍭 filterQuery', 'color:#42b983', filterQuery);
    eventEmitter.emit(`filter_id`, filterQuery)
  }, [_refetchTrigger, filterQuery])

  useEffect(() => {
    if (!eventEmitter) return
    eventEmitter.on(`manage_filter`, fetchDetails)
    return () => {
      eventEmitter.off(`manage_filter`, fetchDetails)
    }
  }, [eventEmitter, JSON.stringify(filters)])

  useEffect(() => {
    // refetchFilters()
  }, [refetchTrigger])

  const [query, setQuery] = useState('')

  const addFilter = (filter: string) => {
    setFilters(prev => [...prev, filter])
  }


  
  
  useEffect(() => {
    if(!cached_filter_items?.length) return
    console.log('%c Line:94 🍎 cached_filter_items', 'color:#f5ce50', cached_filter_items);
    const fetchFilter = async () => { //Refactor this function
      setFilters((prev) => {
        // Convert previous filters to a Map
        const updatedFilters = new Map(prev.map(item => [item.id, item]));
      
        (cached_filter_items || []).forEach((item: any) => {
          const label = item?.name || item?.label;
          const formattedName = label?.toLowerCase().replace(/\s+/g, '_');
          const href = `${baseUrl}&sub_tab=${formattedName}`;
      
          // Merge with existing item or add new one
          updatedFilters.set(item.id, { 
            ...updatedFilters.get(item.id), 
            ...item, 
            href, 
            label,
            default_filter: item.default_filter.map((filter: any) => {
              console.log("%c Line:113 🥐 filter", "color:#e41a6a", filter);
              if (filter.type === 'criteria') {
                return {
                  ...filter,
                  values: filter.values.map((value: string) => ({
                    label: value,
                    value: value,
                  })),
                };
              }
              // console.log("%c Line:124 🍣 filter", "color:#ffdd4d", filter);
              // return filter;
            }), 
          });
        });
      
        return [...updatedFilters.values()]; // Convert Map back to an array
      });
      
    }

    fetchFilter()
  }, [cached_filter_items?.length])

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
    filterQuery,
    setFilterQuery,
    _filterQuery,
    _setRefetchTrigger,
    _refetchTrigger,
  } as IState

  const actions = {
    addFilter,
    handleOnChange,
    handleDelete,
    handleDuplicateTab,
  } as IAction

  return (
    <FilterContext.Provider value={{ state, filterQuery, actions }}>
      {children}
    </FilterContext.Provider>
  )
}

export default FilterProvider
