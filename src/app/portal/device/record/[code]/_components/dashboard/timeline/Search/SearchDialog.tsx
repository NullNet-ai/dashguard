'use client'

import { type IAdvanceFilters } from '@dna-platform/common-orm'
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { SearchIcon } from 'lucide-react'
import { useContext, useState } from 'react'

import { GridContext } from '~/components/platform/Grid/Provider'
import { Button } from '~/components/ui/button'
import { useDebounce } from '~/components/ui/multi-select'
import { cn } from '~/lib/utils'

import { YYYSearchGridContext } from './Provider'
import SearchResult from './SearchResult'
import { type ISearchItemResult } from './types'
import { transformSearchData } from './utils/transformSearchData'

export default function SearchDialog() {
  const { state, actions } = useContext(YYYSearchGridContext)
  const { state: gridState } = useContext(GridContext)
  const [openDialog, setOpenDialog] = useState(false)

  const {
    searchableFields = [],
    entity = '',
    searchConfig,
  } = gridState?.config ?? {}
  const { advanceFilterItems = [] } = state ?? {}
  const { query = '' } = state ?? {}
  const { handleSearchQuery } = actions ?? {}

  const debouncedSearchInput = useDebounce(query, 500)

  // const data = handleSearchQuery!(
  //   {
  //     entity: 'device',
  //     current: 0,
  //     limit: 100,
  //     pluck: [
  //       'id',
  //       'code',
  //       'created_date',
  //       'updated_date',
  //       'status',
  //       'instance_name',
  //       'created_by',
  //       'updated_by',
  //       'model',
  //       'system_id',
  //       'device_version',
  //       'updated_time',
  //       'created_time',
  //       'previous_status',
  //       'device_status',
  //     ],
  //     advance_filters: [
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'contacts',
  //         field: 'contact_created_by',
  //         label: 'Created By',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'created_date',
  //         label: 'Created Date',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'contacts',
  //         field: 'contact_updated_by',
  //         label: 'Updated By',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'updated_date',
  //         label: 'Updated Date',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'devices',
  //         field: 'last_heartbeat',
  //         label: 'Last Heartbeat',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'device_version',
  //         label: 'Version',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'system_id',
  //         label: 'UUID',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'devices',
  //         field: 'device_status',
  //         label: 'Status',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device_interface_addresses',
  //         field: 'address',
  //         label: 'WAN Address',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device_group_settings',
  //         field: 'name',
  //         label: 'Hierarchy',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'model',
  //         label: 'Type',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'instance_name',
  //         label: 'Instance Name',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'code',
  //         label: 'ID',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'or',
  //       },
  //       {
  //         type: 'criteria',
  //         operator: 'like',
  //         values: [
  //           '',
  //         ],
  //         entity: 'device',
  //         field: 'status',
  //         label: 'State',
  //       },
  //       {
  //         type: 'operator',
  //         operator: 'and',
  //       },
  //       {
  //         entity: 'devices',
  //         operator: 'equal',
  //         type: 'criteria',
  //         field: 'status',
  //         values: [
  //           'Active',
  //         ],
  //       },
  //       {
  //         entity: 'device',
  //         operator: 'or',
  //         type: 'operator',
  //       },
  //       {
  //         entity: 'devices',
  //         operator: 'equal',
  //         type: 'criteria',
  //         field: 'status',
  //         values: [
  //           'Draft',
  //         ],
  //       },
  //       {
  //         entity: 'device',
  //         operator: 'or',
  //         type: 'operator',
  //       },
  //       {
  //         entity: 'devices',
  //         operator: 'equal',
  //         type: 'criteria',
  //         field: 'status',
  //         values: [
  //           'Archived',
  //         ],
  //       },
  //     ],
  //   }, {
  //     refetchOnWindowFocus: false,
  //     gcTime: 0,
  //     enabled: false,
  //   },
  // )

  const { items } = { items: [] }
  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

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
          handleCloseDialog()
          actions?.handleQuery('')
        } }
      >
        <DialogBackdrop
          className = "fixed inset-0 bg-gray-500/80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          transition={true}
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
          <DialogPanel
            className = "mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            transition={true}
          >
            <Combobox>
              <div className="relative">
                <MagnifyingGlassIcon
                  aria-hidden = "true"
                  className = "pointer-events-none absolute left-4 top-3.5 size-5 text-gray-400"
                />
                <ComboboxInput
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  className = "h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder = "Search..."
                  value = { query }
                  onBlur = { () => {
                    actions?.handleOpen(false)
                  }}
                  onChange = { (event) => {
                    actions?.handleQuery(event.target.value)
                  }}
                  onFocus = { () => {
                    actions?.handleOpen(true)
                  }}
                />
              </div>

              {state?.open && !!debouncedSearchInput && (
                <ComboboxOptions
                  as = "ul"
                  className = "max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                  static={true}
                >
                  <li className="p-2">
                    <h2 className="mb-2 mt-1 px-3 text-xs font-semibold text-gray-500">
                      <SearchResult
                        closeDialog = { handleCloseDialog }
                        results = {
                          (transformSearchData(
                            items, debouncedSearchInput, searchableFields,
                          ) as ISearchItemResult[]) || null
                        }
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
