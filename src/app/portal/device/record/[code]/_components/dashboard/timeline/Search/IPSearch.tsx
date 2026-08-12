'use client';

import { type IAdvanceFilters } from '@dna-platform/common-orm';
import { Combobox, ComboboxInput, ComboboxOptions } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { X } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';

import { Button } from '~/components/ui/button';
import { useDebounce } from '~/components/ui/multi-select';
import { Badge } from '~/components/ui/badge';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useEventEmitter } from '~/context/EventEmitterProvider';

import { SearchGraphContext } from './Provider';
import SearchResult from './SearchResult';
import { transformSearchData } from './utils/transformSearchData';
import { cn, formatAndCapitalize } from '~/lib/utils';
import { usePathname } from 'next/navigation';
import { testIDFormatter } from '~/utils/formatter';
import { type ISearchItemResult } from './types';

export default function IPSearch() {
  const { state, actions } = useContext(SearchGraphContext);
  const eventEmitter = useEventEmitter();

  const path = usePathname();
  const [, , path1, path2] = path.split('/');

  const { searchItems = [], rawItems: items, query = '' } = state ?? {};
  const { searchableFields = [] } = state?.config ?? {};
  const { advanceFilterItems = [] } = state ?? {};
  const { handleSearchQuery } = actions ?? {};

  const debouncedSearchInput = useDebounce(query, 500);
  const debouncedInlineFilter = useDebounce(query, 300);

  const displaySearchItemResolver = useMemo(() => {
    return searchItems.reduce((acc: any[], item: any) => {
      if (!item.filters || !Array.isArray(item.filters)) {
        acc.push(item);
      } else {
        acc.push(...item.filters);
      }
      return acc;
    }, []);
  }, [searchItems]);

  const selectedSearchItems = useMemo(
    () => displaySearchItemResolver.filter((item: any) => !item?.default),
    [displaySearchItemResolver],
  );

  const defaultSearchItems = useMemo(() => {
    return selectedSearchItems
      .map((item: any) => ({ ...item, hidden: false }))
      .filter((item: any) => item.type !== 'operator')
      .filter(
        (item: any, index: number, self: any[]) =>
          index ===
          self.findIndex(
            (t: any) =>
              t.entity === item.entity &&
              t.field === item.field &&
              JSON.stringify(t.values) === JSON.stringify(item.values),
          ),
      );
  }, [selectedSearchItems]);

  useEffect(() => {
    if (!debouncedSearchInput) return;
    handleSearchQuery?.(
      {
        entity: 'connections',
        current: 0,
        limit: 20,
        pluck: [
          'id',
          'code',
          'categories',
          'status',
          'created_date',
          'updated_date',
          'created_time',
          'updated_time',
        ],
        advance_filters: advanceFilterItems as IAdvanceFilters[],
      },
      {
        refetchOnWindowFocus: false,
        gcTime: 0,
        enabled: true,
      },
    );
  }, [debouncedSearchInput]);

  useEffect(() => {
    if (debouncedInlineFilter == null) return;
    // eventEmitter.emit('timeline_inline_filter', debouncedInlineFilter)
  }, [debouncedInlineFilter, eventEmitter]);

  useEffect(() => {
    eventEmitter.emit('timeline_search', defaultSearchItems);
  }, [eventEmitter, defaultSearchItems]);

  const results = useMemo<ISearchItemResult[] | null>(() => {
    if (!debouncedSearchInput) return null;
    return (
      (transformSearchData(
        items,
        debouncedSearchInput,
        searchableFields,
      ) as ISearchItemResult[]) ?? null
    );
  }, [items, debouncedSearchInput, searchableFields]);

  return (
    <div className="flex w-full flex-col gap-2 py-2 pr-[8px]">
      <Combobox>
        <div className="relative">
          <div className="flex w-full flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap rounded-md border pl-2 pr-3 focus-within:border-primary">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="mr-1 h-4 w-4 shrink-0 text-muted-foreground"
            />
            {defaultSearchItems.length > 0 && (
              <div className="flex items-center gap-1">
                {defaultSearchItems.map((item: any) => (
                  <TooltipProvider key={item.id}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Badge
                          className={cn(
                            'item-ref m-0 flex min-w-0 max-w-24 items-center gap-1 whitespace-nowrap',
                          )}
                          variant="secondary"
                        >
                          <span className="min-w-0 max-w-28 truncate">
                            {item.type === 'criteria'
                              ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ?? item?.values?.[0]}"`
                              : item?.operator}
                          </span>
                          {item.type === 'criteria' && !item.default && (
                            <Button
                              className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                              size="xs"
                              variant="ghost"
                              onClick={() =>
                                actions?.handleRemoveSearchItem(item)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start">
                        {item.type === 'criteria'
                          ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ?? item?.values?.[0]}"`
                          : item?.operator}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
            <ComboboxInput
              className="max-w- h-full w-full flex-1 border-none bg-transparent pl-1 pr-0 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
              placeholder={
                defaultSearchItems.length > 0 || (query?.length ?? 0) > 0
                  ? ''
                  : 'Search by Source IP/Country'
              }
              data-test-id={testIDFormatter(`${path1}-${path2}-srch-input`)}
              value={query}
              onChange={(e) => actions?.handleQuery(e.target.value)}
              onBlur={() => actions?.handleOpen(false)}
              onFocus={() => actions?.handleOpen(true)}
              onKeyDown={(e) => {
                if (
                  (e.key === 'Backspace' || e.key === 'Delete') &&
                  (query?.trim()?.length ?? 0) === 0
                ) {
                  const last =
                    defaultSearchItems[defaultSearchItems.length - 1];
                  if (last && !last.default) {
                    e.preventDefault();
                    actions?.handleRemoveSearchItem(last);
                  }
                }
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
                <SearchResult results={state?.isLoading ? null : results} />
              </li>
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
    </div>
  );
}
