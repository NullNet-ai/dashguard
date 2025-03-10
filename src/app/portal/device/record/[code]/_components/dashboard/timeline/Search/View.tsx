'use client'

import { type IAdvanceFilters } from '@dna-platform/common-orm'
import { Combobox, ComboboxInput, ComboboxOptions } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useContext, useEffect, useMemo, useState } from 'react'

import { useDebounce } from '~/components/ui/multi-select'
import useWindowSize from '~/hooks/use-resize'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'

import { SearchGraphContext } from './Provider'
import SearchResult from './SearchResult'
import { type ISearchableField, type ISearchItemResult } from './types'
import { transformSearchData } from './utils/transformSearchData'

const pluckFields = [
  'id',
  'code',
  'interface_name',
  'source_mac',
  'destination_mac',
  'ether_type',
  'protocol',
  'source_ip',
  'destination_ip',
  'source_port',
  'destination_port',
]

export default function Search() {
  const { state, actions } = useContext(SearchGraphContext)

  const { width } = useWindowSize()
  const screenSize = useScreenType()
  const isMobile = screenSize !== '2xl' && screenSize !== 'xl' && screenSize !== 'lg'

  const { advanceFilterItems = [], config , rawItems: items} = state ?? {}
  console.log('%c Line:40 🍤 items', 'color:#465975', items);
  const { searchableFields } = config ?? {}
  const { query = 'test' } = state ?? {}
  const { handleSearchQuery, setSearchParams } = actions ?? {}
  // const [items, setItems] = useState()

  const debouncedSearchInput = useDebounce(query, 500)
  

  // const data = useMemo(() => 
    // handleSearchQuery?.(
    //   {
    //     entity: 'packets',
    //     current: 0,
    //     limit: 100,
    //     pluck: pluckFields,
    //     advance_filters: advanceFilterItems as IAdvanceFilters<string>[],
    //   }
    // )
  // , [JSON.stringify(advanceFilterItems)])

  useEffect(() => {

    const b = async () => {

     
      setSearchParams(
        {
          entity: 'packets',
          current: 0,
          limit: 100,
          pluck: pluckFields,
          advance_filters: advanceFilterItems as IAdvanceFilters<string>[],
        }
      )

      // 
    // const a = await refetchSearch()
    // 
    // }
    // if (debouncedSearchInput) {
      // actions?.handleQuery(debouncedSearchInput)
      //  const a = b()
      //  
    }
    b()
    console.log('%c Line:93 🌰 debouncedSearchInput', 'color:#ed9ec7', debouncedSearchInput);
  }, [debouncedSearchInput])

  // const { items } = data || { items: undefined }
  

  return (
    <Combobox>
      <div
        className={cn(`relative`)}
        style={{ width: isMobile ? width - (screenSize === 'md' ? 100 : 16) : 'auto' }}
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
                    items, debouncedSearchInput, searchableFields as ISearchableField[],
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
