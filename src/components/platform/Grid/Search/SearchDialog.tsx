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
import { SearchIcon } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '~/components/ui/button';
import { useDebounce } from '~/components/ui/multi-select';

import { GridContext } from '../Provider';

import { SearchGridContext } from './Provider';
import SearchResult from './SearchResult';
import { type ISearchItemResult } from './types';
import { transformSearchData } from './utils/transformSearchData';
import { cn } from '~/lib/utils';

export default function SearchDialog() {
  const { state, actions } = useContext(SearchGridContext);
  const { state: gridState } = useContext(GridContext);
  const [openDialog, setOpenDialog] = useState(false);

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
    }, {
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
          className={cn('flex gap-x-1')}
          size='md'
          variant='softPrimary'
          onClick={() => handleOpenDialog()}
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
                            items, debouncedSearchInput, searchableFields,
                          ) as ISearchItemResult[]) || null
                        }
                        closeDialog={handleCloseDialog}
                      />
                    </h2>
                  </li>
                </ComboboxOptions>
              )}
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
