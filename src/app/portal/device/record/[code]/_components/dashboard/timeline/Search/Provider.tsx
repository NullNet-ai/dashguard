'use client'
import React, {
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ulid } from 'ulid'

import { getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import { api } from '~/trpc/react'

import { fetchTabFilter } from '../Filter/components/SideDrawer/actions'

import { fetchSearchFilter } from './Actions/FetchSearchFilter'
import { UpdateSearchFilter } from './Actions/UpdateSearchFilter'
import { searchableFields, searchConfig, timeDuration } from './configs'
import {
  type IAction,
  type ICreateContext,
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IState,
} from './types'
import { removeSearchItems } from './utils/removeSearchItems'

export const SearchGraphContext = React.createContext<ICreateContext>({
})

interface IProps extends PropsWithChildren {
  test?: any,
  params?:any
}

export default function GraphSearchProvider({ children, params }: IProps) {
  
  const { defaultEntity } = searchConfig ?? {}

  const [_query, setQuery] = useState<string>('')
  
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    [],
  )
  const [rawItems, setRawItems] = useState<ISearchItem[]>( )
  console.log('%c Line:46 🌶 rawItems', 'color:#4fff4B', rawItems);
  const [open, setOpen] = useState(false)
  const [search_params, setSearchParams] = useState({})
  // const [searchItems, setItems] = useState()

  

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values }) => ({
        entity: entity as string,
        operator,
        type,
        field,
        values,
      }),
    ) as ISearchItem[]

    return searchableFields.reduce(
      (acc: any, { accessorKey: _, ...item }: any, index: any) => {
        return [
          {
            type: 'criteria',
            operator: 'equal',
            values: [_query],
            entity: defaultEntity,
            ...item,
          },
          ...(index !== 0
            ? [{ type: 'operator', operator: 'or' }]
            : []),
          ...acc,
        ]
      }, [
        ...(advanceFilter?.length
          ? [{ type: 'operator', operator: 'and' }]
          : []),
        ...advanceFilter,
      ],
    )
  }, [_query])

  const handleQuery = (data: React.SetStateAction<string>) => {
    setQuery(data)
  }

  const handleOpen = (open: boolean) => {
    setOpen(open)
  }

  const {time_count,time_unit } = timeDuration
  console.log('%c Line:98 🥖 search_params', 'color:#33a5ff', search_params);

  const { data , refetch: refetchSearch} = api?.packet?.filterPackets.useQuery({ ...search_params, time_range:  getLastTimeStamp(time_count, time_unit as 'minute', new Date()), device_id: params?.id },{
    refetchOnWindowFocus: false,
    gcTime: 0,
    enabled: false,
  })
  
  
  const handleSearchQuery = async(
    search_params: ISearchParams,
  ) => {

    
    
    console.log('%c Line:113 🍓 search_params', 'color:#e41a6a', search_params);
    setSearchParams(
      search_params
    )

  //  const _data =  await refetchSearch()
  //  
  }

  
  useEffect(() => {

    
    const b = async () => {
     
     const {data}:any = await refetchSearch()
     console.log('%c Line:125 🍬 data', 'color:#7f2b82', data);
     
     setRawItems(data?.items)
     }

       b()
  },[
    JSON.stringify(search_params),
  ])

  const handleAddSearchItem = async (filterItem: ISearchItemResult) => {
    // eslint-disable-next-line no-unused-vars
    const { count: _, ...rest } = filterItem ?? {}
    const advanceFilter = searchItems.map(({ entity, ...rest }) => ({
      entity: entity || defaultEntity,
      ...rest,
    })) as ISearchItem[]
    setQuery('')
    const updateSearchItems = [
      ...advanceFilter,
      ...(advanceFilter.length
        ? [{ id: ulid(), type: 'operator', operator: 'and' }]
        : []),
      {
        ...rest,
        id: ulid(),
        values:
          [rest?.values?.[0]],
        display_value: rest?.values?.[0],
        operator: rest?.operator === 'like' ? 'equal' : rest?.operator,
      },
    ] as ISearchItem[]
    setSearchItems(updateSearchItems)

    
    await UpdateSearchFilter({
      filters: updateSearchItems,
      filterItemId: filterItem.id,
    })
  }

  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery('')
    const updatedSearchItems = removeSearchItems(searchItems, filterItem)
    setSearchItems(updatedSearchItems)

    await UpdateSearchFilter({
      filters: updatedSearchItems,
      filterItemId: filterItem.id,
    })
  }

  const handleClearSearchItems = async () => {
    setQuery('')
  }

  const {
    data: cached_search_items = [],
  } = api.timelineFilter.fetchTimelineFilter.useQuery({
    type: 'search',
  })

  
  useEffect(() => {
    setSearchItems(cached_search_items || [])
  }, [cached_search_items?.length])

  const state_context = {
    open,
    searchItems,
    query: _query,
    advanceFilterItems,
    config: {
      searchableFields,
    },
    rawItems
  } as IState
  const actions = {
    handleQuery,
    handleOpen,
    handleSearchQuery,
    handleAddSearchItem,
    handleRemoveSearchItem,
    handleClearSearchItems,
    refetchSearch,
    setSearchParams
  } as IAction

  return (
    <SearchGraphContext.Provider
      value={{
        state: state_context,
        actions,
      }}
    >
      {children}
    </SearchGraphContext.Provider>
  )
}
