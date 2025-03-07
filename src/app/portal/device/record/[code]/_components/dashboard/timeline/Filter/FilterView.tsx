'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { useContext } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'

import { ManageFilterProvider } from './components/SideDrawer/Provider'
import GridManageFilter from './components/SideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'

const FilterView = () => {
  const { state } = useContext(FilterContext)

  const { filters = [] } = state ?? {}
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

          {filters?.map((filter, index) => (
            <span
            className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm"
            onClick = { () => {
              // window.history.replaceState({}, '', filter?.href)
            } }
            key={index}
          >
            {filter?.label}
          {filter?.label !== 'All Data' && <FilterProperty filter={filter} />}
          </span>
            // <span className = "flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm" key = { index }>
            //   {/* <Card className="flex items-center justify-between p-2 w-32 bg-muted rounded-lg"> */}
            //   <span
            //     className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm"
            //     onClick = { () => {
            //       window.history.replaceState({}, '', filter?.href)
            //     } }
            //   >
            //     {filter?.label}
            //   {filter?.label !== 'All Data' && <FilterProperty filter={filter} />}
            //   </span>
            //   {/* <div className="flex-1 overflow-y-auto">
            // <StateTab
            //   defaultValue="filter"
            //   persistKey="side-drawer-tabs"
            //   size="sm"
            //   tabs={filters ?? []}
            //   variant="default"
            // /></div> */}

            //   {/* </Card> */}
            // </span>
          ))}
          <div className="h-[36px] justify-between flex gap-x-2">

            <button className="flex min-w-8 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm" onClick={handleOpenSideDrawer}>
              <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* <Card> */}
      {/* </Card> */}
    </div>
  )
}

export default FilterView
