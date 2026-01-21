'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { Fragment, useContext, useState, useEffect } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import { columns as configColumns, } from './components/GroupFilterSideDrawer/config'
import { ManageFilterProvider } from './components/GroupFilterSideDrawer/Provider'
import GridManageFilter from './components/GroupFilterSideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'
import { useRouter } from 'next/navigation'
import { useEventEmitter } from '~/context/EventEmitterProvider'

const FilterView = () => {
  const { state } = useContext(FilterContext)
  const { filters = [], _setRefetchTrigger, setFilterQuery, filter_type } = state ?? {}
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions
  const router = useRouter();
  const defaultTab = filters.find(tab => tab.label === 'Live Data')?.id || ''
  
  const [activeLabel, setActiveLabel] = useState<string>(defaultTab)
  
  const eventEmitter = useEventEmitter()

  const [columns, setColumns] = useState<any>([])

  useEffect(() => {
    if (filter_type === 'map_filter') {
      setColumns([
        {
          header: 'Source Country',
          label: 'Source Country',
          accessorKey: 'source_country.country',
          custom: true,
        },
        {
          header: 'Destination Country',
          label: 'Destination Country',
          accessorKey: 'destination_country.country',
          custom: true,
        },
      ])
    } else {
      setColumns(configColumns)
    }
  }, [filter_type])
  
  useEffect(() => {
    const setFID = (data: any) => {
      if (typeof data !== 'string') return
      setActiveLabel(filters?.find(e => e.id === data)?.id || defaultTab)
    }
    eventEmitter.on(`timeline_filter_id_active_label`, setFID)
    return () => {
      eventEmitter.off(`timeline_filter_id_active_label`, setFID)
    }
  }, [eventEmitter, filters])

  const handleTabClick = (tabHref: string) => {
    eventEmitter.emit('timeline_filter_id', tabHref)
    setActiveLabel(tabHref)
  }

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      // title: 'Manage Filter',
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
           <ManageFilterProvider columns = { columns } filter_type ={ filter_type as string } tab = { { name: 'New Filter' } }>
            <GridManageFilter filter_type={filter_type as string} /> 
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    })
  }

  return (
    <div className="p-4 ps-0 pb-0 flex flex-col gap-4 sticky">
      <div className="flex">
        <div className="h-[36px] justify-between flex gap-x-2">
          {filters.map((tab) => {
            const isActive = activeLabel === tab.id
            console.log("%c Line:57 🍩 isActive", "color:#e41a6a", isActive);

            return (
              <Fragment key={tab.id}>
                <Button
                  aria-selected={isActive}
                  className="flex items-center justify-between rounded-md px-2 py-0 pr-2 text-sm"
                  role="tab"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    handleTabClick(tab.id)
                    setFilterQuery?.(tab?.id ?? {})
                    _setRefetchTrigger?.((prev: number) => prev + 1)
                  }}
                >
                  <span className={`${isActive ? 'text-primary' : 'text-gray-600'}`}>
                    {tab.label}
                  </span>
                  {tab?.label !== 'Live Data' && <FilterProperty filter={tab} filter_type={filter_type as string} />}
                </Button>
              </Fragment>
            )
          })}
          <button
            className="flex min-w-8 items-center justify-between rounded-md px-3 py-0 pr-1 text-sm"
            onClick={handleOpenSideDrawer}
          >
            <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterView
