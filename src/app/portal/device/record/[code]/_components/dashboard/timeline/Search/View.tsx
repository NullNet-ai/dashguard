'use client'

import { type IAdvanceFilters } from '@dna-platform/common-orm'
import { Combobox, ComboboxInput, ComboboxOptions } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useContext } from 'react'

import { GridContext } from '~/components/platform/Grid/Provider'
import { useDebounce } from '~/components/ui/multi-select'
import useWindowSize from '~/hooks/use-resize'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'

import { YYYSearchGridContext } from './Provider'
import SearchResult from './SearchResult'
import { type ISearchItemResult } from './types'
import { transformSearchData } from './utils/transformSearchData'

export default function Search({ parentType }: any) {
  const { state, actions } = useContext(YYYSearchGridContext)
  console.log('%c Line:21 🌮 state', 'color:#6ec1c2', state)
  const { state: gridState } = useContext(GridContext)

  const { width } = useWindowSize()
  const screenSize = useScreenType()
  const isMobile = screenSize !== '2xl' && screenSize !== 'xl' && screenSize !== 'lg'

  const { advanceFilterItems = [], config: { searchableFields } } = state ?? {}
  console.log('%c Line:34 🍌 advanceFilterItems', 'color:#fca650', advanceFilterItems)
  const { query = 'test' } = state ?? {}
  const { handleSearchQuery } = actions ?? {}
  console.log('%c Line:35 🍤 handleSearchQuery', 'color:#4fff4B', handleSearchQuery)

  const debouncedSearchInput = useDebounce(query, 500)

  const data = handleSearchQuery?.(
    {
      entity: 'device',
      current: 0,
      limit: 100,
      pluck: [
        'id',
        'code',
        'created_date',
        'updated_date',
        'status',
        'instance_name',
        'created_by',
        'updated_by',
        'model',
        'system_id',
        'device_version',
        'updated_time',
        'created_time',
        'previous_status',
        'device_status',
      ],
      advance_filters: advanceFilterItems,
    }, {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: true,
    },
  )

  console.log('%c Line:305 🌭 data', 'color:#465975', data)
  const { items } = data || { items: [] }

  return (
    <Combobox>
      <div
        className={cn(`relative`)}
        style={{ width: isMobile ? parentType === 'record' ? '100%' : width - (screenSize === 'md' ? 100 : 16) : 'auto' }}
      >
        <div className="flex md:flex-wrap lg:flex-nowrap items-center md:gap-2 rounded-md border px-2 ps-3 focus-within:border-primary">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="h-5 w-5 text-muted-foreground"
          />
          <ComboboxInput
            className="flex-grow border-none px-1.5 md:px-3 h-[35px] bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
            placeholder="Search..."
            value={query}
            onBlur={() => {
              actions?.handleOpen(false)
            }}
            onChange={(event) => {
              actions?.handleQuery(event.target.value)
            }}
            onFocus={() => {
              actions?.handleOpen(true)
            }}
          />

        </div>
        {state?.open && !!debouncedSearchInput && (
          <ComboboxOptions
            as="ul"
            className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
            static={true}
          >
            <li className="p-2">
              <SearchResult
                results={
                  (transformSearchData(
                    items, debouncedSearchInput, searchableFields,
                  ) as ISearchItemResult[]) || null
                }
              />
            </li>
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  )
}
