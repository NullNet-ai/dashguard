'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { Fragment, useContext, useState, useEffect } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import { columns } from './components/GroupFilterSideDrawer/config'
import { ManageFilterProvider } from './components/GroupFilterSideDrawer/Provider'
import GridManageFilter from './components/GroupFilterSideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'
import { useRouter } from 'next/navigation'

const FilterView = () => {
  const { state } = useContext(FilterContext)
  const { filters = [], _setRefetchTrigger, setFilterQuery, filter_type } = state ?? {}
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions
  const router = useRouter();
  const defaultTab = filters.find(tab => tab.label === 'Live Data')?.id || ''

  const [activeLabel, setActiveLabel] = useState<string>(defaultTab)

  useEffect(() => {
    if (!activeLabel && defaultTab) {
      setActiveLabel(defaultTab)
    }
  }, [defaultTab])

  const handleTabClick = (tabHref: string) => {
    setActiveLabel(tabHref)
  }

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      title: 'Manage Filter',
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
