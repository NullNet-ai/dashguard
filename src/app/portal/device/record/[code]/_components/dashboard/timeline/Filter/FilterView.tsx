'use client'
import { Combobox, ComboboxInput, ComboboxOptions } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { head } from 'lodash'
import { useContext } from 'react'

import NetworkFlow from '../../network-traffic-visualization'

import FilterProperty from './components/SideDrawer/FilterProperty'
import { ManageFilterProvider } from './components/SideDrawer/Provider'
import GridManageFilter from './components/SideDrawer/View'
import { FilterContext } from './FilterProvider'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import StateTab from '~/components/platform/StateTab'
import { Card } from '~/components/ui/card'

const FilterView = () => {
  const { state, actions } = useContext(FilterContext)
  const { filters, query } = state ?? {}
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            columns = { [
              {
                header: 'Source IP Address',
                label: 'Source IP Address',
                accessorKey: 'source_ip_address',
              },
              {
                header: 'Source Port',
                label: 'Source Port',
                accessorKey: 'source_port',
              },
              {
                header: 'Destination IP Address',
                label: 'Destination IP Address',
                accessorKey: 'destination_ip_address',
              },
              {
                header: 'Destination Port',
                label: 'Destination Port',
                accessorKey: 'destination_port',
              },
              {
                header: 'TCP Protocol',
                label: 'TCP',
                accessorKey: 'tcp',
              },
              {
                header: 'UDP Protocol',
                label: 'UDP',
                accessorKey: 'udp',
              },
              {
                header: 'IP Version',
                label: 'IP Version',
                accessorKey: 'ip_version',
              },
              {
                header: 'Interfaces',
                label: 'Interfaces',
                accessorKey: 'interfaces',
              },
            ]}
            tab = { {
              name: 'New Filter',
            } }
          >
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    })
  }

  // grid filters = kung mag click kag grid filters mo change ang URL para maka rerender para mo update ang data,
  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">

      <div className="flex mb-2">
        <div className="h-[36px] justify-between flex gap-x-2">

          {/* {filters?.map((filter, index) => ( */}
          {/* // <span className = "flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm" key = { index }> */}
          {/* <Card className="flex items-center justify-between p-2 w-32 bg-muted rounded-lg"> */}
          {/* <span className = "flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm">{filter}</span> */}
          <div className="flex-1 overflow-y-auto">
            <StateTab
              defaultValue="filter"
              persistKey="side-drawer-tabs"
              size="sm"
              tabs={filters ?? []}
              variant="default"
            />
            {/* <FilterProperty /> */}
          </div>

          {/* </Card> */}
          {/* // </span> */}
          {/* ))} */}
          <div className="h-[36px] justify-between flex gap-x-2">

            <button className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm" onClick={handleOpenSideDrawer}>
              +
            </button>
          </div>
        </div>
      </div>
      <div className="flex md:flex-wrap lg:flex-nowrap items-center md:gap-2 self-end rounded-md border px-2 ps-3 focus-within:border-primary w-full max-w-[400px]">
        {/* <input
          type="text"
          value="Hellow"
          className="flex-grow border-none px-1.5 md:px-3 h-[35px] bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
          placeholder="Search"
          onChange={() => { console.log("Hello I'm Here!!!") }}
        />
        <button
          className='my-auto'
          >
          <SearchIcon className="size-4"/>
        </button> */}
        <Combobox>
          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden = "true"
              className = "pointer-events-none absolute left-2 top-2.5 size-5 text-gray-400"
            />
            <ComboboxInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus = { true }
              className="h-10 w-full border-0 bg-transparent pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Search..."
              value={query}
              onChange={(event) => {
                actions?.handleOnChange(event.target.value)
              } }
              // onBlur={() => {
              //   actions?.handleOpen(false);
              // }}
              // onFocus={() => {
              //   actions?.handleOpen(true);
              // }}
            />
          </div>

          {/* {state?.open && !!debouncedSearchInput && ( */}
          <ComboboxOptions
            as = "ul"
            className = "max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
            static={true}
          >
            {/* <li className="p-2">
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
                  </li> */}
          </ComboboxOptions>
          {/* )} */}
        </Combobox>

      </div>
      {/* <Card> */}
      <NetworkFlow />
      {/* </Card> */}
    </div>
  )
}

export default FilterView
