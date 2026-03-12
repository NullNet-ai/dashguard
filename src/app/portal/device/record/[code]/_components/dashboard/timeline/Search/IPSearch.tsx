'use client'

import { type IAdvanceFilters } from '@dna-platform/common-orm'
import { Combobox, ComboboxInput, ComboboxOptions } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { X } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useDebounce } from '~/components/ui/multi-select'
import { Badge } from '~/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { useEventEmitter } from '~/context/EventEmitterProvider'

import { SearchGraphContext } from './Provider'
import SearchResult from './SearchResult'
import { transformSearchData } from './utils/transformSearchData'
import { cn, formatAndCapitalize } from '~/lib/utils'
import { usePathname } from 'next/navigation'
import { testIDFormatter } from '~/utils/formatter'
import { type ISearchItemResult } from './types'

export default function IPSearch() {
  const { state, actions } = useContext(SearchGraphContext)
  const eventEmitter = useEventEmitter()

  const path = usePathname()
  const [, , path1, path2] = path.split('/')

  const { searchItems = [], rawItems: items, query = '' } = state ?? {}
  const { searchableFields = [], } = state?.config ?? {}
  const { advanceFilterItems = [] } = state ?? {}
  const { handleSearchQuery } = actions ?? {}

  const debouncedSearchInput = useDebounce(query, 500)
  const debouncedInlineFilter = useDebounce(query, 300)

  const displaySearchItemResolver = useMemo(() => {
    return searchItems.reduce((acc: any[], item: any) => {
      if (!item.filters || !Array.isArray(item.filters)) {
        acc.push(item)
      } else {
        acc.push(...item.filters)
      }
      return acc
    }, [])
  }, [searchItems])

  const selectedSearchItems = useMemo(
    () => displaySearchItemResolver.filter((item: any) => !item?.default),
    [displaySearchItemResolver],
  )

  const defaultSearchItems = useMemo(() => {
    return selectedSearchItems
      .map((item: any) => ({ ...item, hidden: false }))
      .filter((item: any) => item.type !== 'operator')
      .filter(
        (item: any, index: number, self: any[]) =>
          index === self.findIndex(
            (t: any) =>
              t.entity === item.entity &&
              t.field === item.field &&
              JSON.stringify(t.values) === JSON.stringify(item.values),
          ),
      )
  }, [selectedSearchItems])

  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!debouncedSearchInput) return
    handleSearchQuery?.(
      {
        entity: 'connections',
        current: 0,
        limit: 100,
        pluck: ['id', 'code', 'categories', 'status', 'created_date', 'updated_date', 'created_time', 'updated_time'],
        advance_filters: advanceFilterItems as IAdvanceFilters[],
      },
      {
        refetchOnWindowFocus: false,
        gcTime: 0,
        enabled: true,
      },
    )
  }, [debouncedSearchInput])

  useEffect(() => {
    if (debouncedInlineFilter == null) return
    eventEmitter.emit('timeline_inline_filter', debouncedInlineFilter)
  }, [debouncedInlineFilter, eventEmitter])

  useEffect(() => {
    if (!defaultSearchItems.length) return
    eventEmitter.emit('timeline_search', defaultSearchItems)
  }, [eventEmitter, defaultSearchItems])

  const results = useMemo<ISearchItemResult[] | null>(() => {
    if (!debouncedSearchInput) return null
    return transformSearchData(items, debouncedSearchInput, searchableFields) as ISearchItemResult[] ?? null
  }, [items, debouncedSearchInput, searchableFields])

  return (
    <div className="flex flex-col gap-2 py-2 pr-[8px]">
      <Combobox>
        <div className="relative">
          <div className="flex items-center rounded-md border px-2 ps-3 focus-within:border-primary">
            <MagnifyingGlassIcon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <ComboboxInput
              className="h-7 flex-grow border-none bg-transparent px-1.5 outline-none placeholder:text-muted-foreground focus:ring-0 text-sm"
              placeholder="Search by Source IP/Country"
              data-test-id={testIDFormatter(`${path1}-${path2}-srch-input`)}
              value={query}
              onChange={(e) => actions?.handleQuery(e.target.value)}
              onBlur={() => actions?.handleOpen(false)}
              onFocus={() => actions?.handleOpen(true)}
            />
          </div>

          {state?.open && !!debouncedSearchInput && (
            <ComboboxOptions
              as="ul"
              className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
              static={true}
            >
              <li className="p-2">
                <SearchResult results={results} />
              </li>
            </ComboboxOptions>
          )}
        </div>
      </Combobox>

      <div className="flex items-center min-h-8">
        <span className="text-sm">Search By:</span>
        {defaultSearchItems.length > 0 && (
          <div>
            <div className="flex items-center flex-wrap gap-1">
              {(() => {
                const first = defaultSearchItems[0]
                const rest = defaultSearchItems.slice(1)
                return (
                  <>
                    {first && (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Badge
                              className={cn('item-ref m-1 flex items-center gap-1 whitespace-nowrap min-w-0')}
                              key={first.id}
                              variant="secondary"
                            >
                              <span className={`truncate min-w-0 flex-1 ${defaultSearchItems.length === 1 ? 'max-w-28' : 'max-w-14'}`}>
                                {first.type === 'criteria'
                                  ? `${first?.label || formatAndCapitalize(first?.field ?? '')} is "${first?.display_value ?? first?.values?.[0]}"`
                                  : first?.operator}
                              </span>
                              {first.type === 'criteria' && !first.default && (
                                <Button
                                  className="h-auto w-auto p-0 text-default/40 text-nowrap hover:bg-transparent focus:outline-none"
                                  key={`${first.id}-remove`}
                                  name="removeSortingButton"
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => actions?.handleRemoveSearchItem(first)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            {first.type === 'criteria'
                              ? `${first?.label || formatAndCapitalize(first?.field ?? '')} is "${first?.display_value ?? first?.values?.[0]}"`
                              : first?.operator}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {rest.length > 0 && (
                      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-[24px] w-auto text-nowrap bg-muted px-2 text-default/70 hover:bg-transparent focus:outline-none"
                            size="xs"
                            variant="outline"
                          >
                            More ({rest.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom">
                          <div className="flex flex-col gap-1 gap-y-2 py-2 px-2">
                            {rest.map((item: any) => (
                              <Badge
                                className="flex items-center gap-1 self-start whitespace-nowrap"
                                key={item.id}
                                variant="secondary"
                              >
                                {item.type === 'criteria'
                                  ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ?? item?.values?.[0]}"`
                                  : item?.operator}
                                {item.type === 'criteria' && !item.default && (
                                  <Button
                                    className="h-auto w-auto p-0 text-default/40 text-nowrap hover:bg-transparent focus:outline-none"
                                    key={`${item.id}-remove`}
                                    name="removeSortingButton"
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => { setMenuOpen(false); actions?.handleRemoveSearchItem(item) }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}