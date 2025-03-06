'use client'
import React, {
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ulid } from 'ulid'

import { UpdateReportFilter } from '~/components/platform/Grid/Action/UpdateReportFilter'
import { GridContext } from '~/components/platform/Grid/Provider'
import { api } from '~/trpc/react'

import {
  type IAction,
  type ICreateContext,
  type ISearchItem,
  type ISearchItemResult,
  type ISearchParams,
  type IState,
} from './types'
import { removeSearchItems } from './utils/removeSearchItems'
import Search from './View'

export const YYYSearchGridContext = React.createContext<ICreateContext>({
})

interface IProps extends PropsWithChildren {
  test?: any
}

export default function GridSearchProvider({ children }: IProps) {
  const { state: gridState } = useContext(GridContext)

  console.log('%c Line:33 🍕', 'color:#e41a6a', gridState)
  const {
    columns = [],
    entity: defaultEntity,
    searchableFields = [
      {
        accessorKey: 'status',
        field: 'status',
        label: 'State',
        entity: 'packets',
        operator: 'like',
      },
      {
        accessorKey: 'code',
        field: 'code',
        label: 'ID',
        entity: 'packets',
        operator: 'like',
      },
      {
        accessorKey: 'interface_name',
        field: 'interface_name',
        label: 'Instance Name',
        entity: 'packets',
        operator: 'like',
      },
      {
        accessorKey: 'source_ip',
        field: 'source_ip',
        label: 'Source IP',
        entity: 'packets',
        operator: 'like',
      },
      {
        accessorKey: 'destination_ip',
        field: 'destination_ip',
        label: 'Destination IP',
        entity: 'packets',
        operator: 'like',
      }
    ],
    searchConfig,
    onFetchRecords,
  } = gridState?.config ?? {}

  console.log('%c Line:144 🍌 searchableFields', 'color:#93c0a4', searchableFields)
  const { parentType } = gridState ?? {}
  /** @STATES */
  const [_query, setQuery] = useState<string>('')
  console.log('%c Line:45 🍺 _query', 'color:#ffdd4d', _query)
  const [searchItems, setSearchItems] = useState<ISearchItem[]>(
    gridState?.advanceFilter || [],
  )
  console.log('%c Line:46 🍇 searchItems', 'color:#33a5ff', searchItems)
  const [open, setOpen] = useState(false)

  const advanceFilterItems = useMemo(() => {
    const advanceFilter = searchItems.map(
      ({ entity, operator, type, field, values }) => ({
        entity: entity || defaultEntity,
        operator,
        type,
        field,
        values,
      }),
    ) as ISearchItem[]
    console.log('%c Line:156 🍔 advanceFilter', 'color:#2eafb0', advanceFilter)
    return searchableFields.reduce(
      // eslint-disable-next-line no-unused-vars
      (acc: any, { accessorKey: _, ...item }: any, index) => {
        return [
          {
            type: 'criteria',
            operator: 'equal',
            values:
              item?.field === 'raw_phone_number'
                ? [_query?.replace(/[^\d]/g, '')]
                : [_query],
            // if entity is not provided, the default entity will be the entity of the grid
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
  }, [_query, columns.length])

  const handleQuery = (data: React.SetStateAction<string>) => {
    setQuery(data)
  }

  console.log('%c Line:205 🍇', 'color:#3f7cff', advanceFilterItems)
  const handleOpen = (open: boolean) => {
    setOpen(open)
  }

  const handleSearchQuery = (
    search_params: ISearchParams,
    options: Record<string, any>,
  ) => {
    console.log('%c Line:100 🍎', 'color:#b03734', search_params)
    const { router = 'packet', resolver = 'filterPackets' } = searchConfig ?? {}
    console.log('%c Line:103 🥟 searchConfig', 'color:#2eafb0', searchConfig)
    // @ts-expect-error - TS doesn't know that `api` is a global variable that is defined in the `trpc` package
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-unsafe-optional-chaining
    const { data } = api?.[router]?.[resolver].useQuery(search_params, options)
    console.log('%c Line:103 🥔 data', 'color:#fca650', data)
    return data
  }

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
          rest?.field === 'raw_phone_number'
            ? [rest?.values?.[0]?.replace(/[^\d]/g, '')]
            : [rest?.values?.[0]],
        display_value: rest?.values?.[0],
        operator: rest?.operator === 'like' ? 'equal' : rest?.operator,
      },
    ] as ISearchItem[]
    setSearchItems(updateSearchItems)
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: updateSearchItems,
      })
      return
    }

    await UpdateReportFilter({
      filters: updateSearchItems,
      filterItemId: filterItem.id,
    })
  }
  const handleRemoveSearchItem = async (filterItem: ISearchItem) => {
    setQuery('')
    const updatedSearchItems = removeSearchItems(searchItems, filterItem)
    setSearchItems(updatedSearchItems)
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: updatedSearchItems,
      })
      return
    }

    await UpdateReportFilter({
      filters: updatedSearchItems,
      filterItemId: filterItem.id,
    })
  }

  const handleClearSearchItems = async () => {
    setQuery('')
    setSearchItems(gridState?.defaultAdvanceFilter || [])
    if (parentType && ['form', 'grid_expansion'].includes(parentType)) {
      onFetchRecords?.({
        advance_filters: gridState?.defaultAdvanceFilter || [],
      })
      return
    }

    await UpdateReportFilter({
      filters: gridState?.defaultAdvanceFilter || [],
    })
  }

  const state_context = {
    open,
    searchItems,
    query: _query,
    advanceFilterItems,
    config: {
      searchableFields: [
        {
          accessorKey: 'status',
          field: 'status',
          label: 'State',
          entity: 'packets',
          operator: 'like',
        },
        {
          accessorKey: 'code',
          field: 'code',
          label: 'ID',
          entity: 'packets',
          operator: 'like',
        },
        {
          accessorKey: 'interface_name',
          field: 'interface_name',
          label: 'Interface Name',
          entity: 'packets',
          operator: 'like',
        },
        {
          accessorKey: 'source_ip',
          field: 'source_ip',
          label: 'Source IP',
          entity: 'packets',
          operator: 'like',
        },
        {
          accessorKey: 'destination_ip',
          field: 'destination_ip',
          label: 'Destination IP',
          entity: 'packets',
          operator: 'like',
        }
      ],
    },
  } as IState
  const actions = {
    handleQuery,
    handleOpen,
    handleSearchQuery,
    handleAddSearchItem,
    handleRemoveSearchItem,
    handleClearSearchItems,
  } as IAction

  return (
    <YYYSearchGridContext.Provider
      value={{
        state: state_context,
        actions,
      }}
    >
      {children}
    </YYYSearchGridContext.Provider>
  )
}
