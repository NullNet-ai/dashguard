'use client';

import { type IAdvanceFilters } from '@dna-platform/common-orm';
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Clock, SearchIcon, X } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '~/components/ui/button';
import { useDebounce } from '~/components/ui/multi-select';

import { GridContext } from '../Provider';

import { SearchGridContext } from './Provider';
import SearchResult from './SearchResult';
import { type ISearchItemResult } from './types';
import { transformSearchData } from './utils/transformSearchData';
import { cn, formatAndCapitalize } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { usePathname } from 'next/navigation'
import { testIDFormatter } from '~/utils/formatter'

export default function SearchDialog() {
  const { state, actions } = useContext(SearchGridContext);
  const { state: gridState } = useContext(GridContext);
  const [openDialog, setOpenDialog] = useState(false);
  const path =  usePathname()
  const [, , path1, path2] = path.split('/')

  const { searchItems = [] } = state ?? {};

  const displaySearchItemResolver = searchItems.reduce((acc: any, item) => {
    if (!item.filters || !Array.isArray(item.filters)) {
      acc.push(item);
    } else {
      acc.push(...item.filters);
    }
    return acc;
  }, []);
  const selectedSearchItems = displaySearchItemResolver?.filter(
    (item: any) => !item?.default,
  );
  const defaultSearchItems = selectedSearchItems
  ?.map((item: any) => ({ ...item, hidden: false }))
  .filter((itm: any) => itm.type !== 'operator')
  .filter((item: any, index: number, self: any) =>
    index === self.findIndex((t: any) =>
      t.entity === item.entity &&
      t.field === item.field &&
      JSON.stringify(t.values) === JSON.stringify(item.values)
    )
  );


  const {
    searchableFields = [],
    entity = '',
    searchConfig,
  } = gridState?.config ?? {};
  const { advanceFilterItems = [] } = state ?? {};
  const { query = '' } = state ?? {};
  const { handleSearchQuery } = actions ?? {};

  const debouncedSearchInput = useDebounce(query, 500);

  const data = handleSearchQuery!(
    {
      entity,
      current: 0,
      limit: 100,
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
      ...(searchConfig?.query_params ?? {}),
    },
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: !!debouncedSearchInput,
    },
  );

  const { items } = data ?? {};
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Button
        className={cn('flex gap-x-1 focus:outline-none focus-visible:outline-none focus-visible:ring-0')}
        size="md"
        variant="softPrimary"
        onClick={() => handleOpenDialog()}
        data-test-id={`${testIDFormatter(`${path1}-${path2}-srch-btn`)}`}
      >
        <SearchIcon className="size-4" />
        <span className="mr-1">Search</span>
      </Button>

      <Dialog
        className="relative z-50"
        open={openDialog}
        onClose={() => {
          handleCloseDialog();
          actions?.handleQuery('');
        }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
          <DialogPanel
            transition
            className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <Combobox>
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-4 top-3.5 size-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  data-test-id={`${testIDFormatter(`${path1}-${path2}-srch-input`)}`}
                  value={query}
                  onChange={(event) => {
                    actions?.handleQuery(event.target.value);
                  }}
                  onBlur={() => {
                    actions?.handleOpen(false);
                  }}
                  onFocus={() => {
                    actions?.handleOpen(true);
                  }}
                />
              </div>

              {state?.open && !!debouncedSearchInput && (
                <ComboboxOptions
                  static
                  as="ul"
                  className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                >
                  <li className="p-2">
                    <h2 className="mb-2 mt-1 px-3 text-xs font-semibold text-gray-500">
                      <SearchResult
                        results={
                          (transformSearchData(
                            items,
                            debouncedSearchInput,
                            searchableFields,
                          ) as ISearchItemResult[]) || null
                        }
                        closeDialog={handleCloseDialog}
                      />
                    </h2>
                  </li>
                </ComboboxOptions>
              )}
            </Combobox>
            {defaultSearchItems?.length ? (
              <div className="p-4">
                <span className="text-xs">Search By:</span>
                <div className="flex flex-row flex-wrap gap-1">
                  {defaultSearchItems?.map((item: any, index: number) => {
                    return (
                      <Badge
                        className={cn(
                          `item-ref m-1 flex items-center gap-1 whitespace-nowrap`,
                        )}
                        key={item.id}
                        variant="secondary"
                      >
                        {item.type === 'criteria'
                          ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                          : item?.operator}
                        {item.type === 'criteria' && !item.default && (
                          <Button
                            className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                            key={`${item.id}-remove`}
                            name="removeSortingButton"
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              actions?.handleRemoveSearchItem(item);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </Badge>
                    );
                  })}
                  <Button
                    type="button"
                    className={cn(
                      `h-[30px] text-default/60 underline hover:no-underline`,
                    )}
                    name="resetSortButton"
                    variant="link"
                    onClick={() => {
                      actions?.handleClearSearchItems();
                    }}
                  >
                    Clear All
                  </Button>
                </div>
                {/* <Separator className='my-2 bg-slate-100'/>
                <div>
                  <span className="text-xs mb-2 block">Recent Searches:</span>
                  <div className='flex flex-col gap-y-2'>
                    <div className='flex items-center gap-x-1'>
                      <Clock className="h-3 w-3 text-gray-400 " />
                      <span className='text-sm text-default'>ID100004</span>
                    </div>
                    <div className='flex items-center gap-x-1'>
                      <Clock className="h-3 w-3 text-gray-400 " />
                      <span className='text-sm text-default'>John Smith</span>
                    </div>
                    <div className='flex items-center gap-x-1'>
                      <Clock className="h-3 w-3 text-gray-400 " />
                      <span className='text-sm text-default'>(+1) 345-009-1234</span>
                    </div>
                  </div>
                </div> */}
              </div>
            ) : null}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
