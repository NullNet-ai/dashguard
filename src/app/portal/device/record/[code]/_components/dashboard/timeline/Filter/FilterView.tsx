'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { Fragment, useContext, useState, useEffect } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import { columns } from './components/SideDrawer/config'
import { ManageFilterProvider } from './components/SideDrawer/Provider'
import GridManageFilter from './components/SideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'

const FilterView = () => {
  const { state } = useContext(FilterContext)
  const { filters = [], _setRefetchTrigger, setFilterQuery } = state ?? {}
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions

  const pathName = usePathname()
  const baseUrl = `${pathName}?current_tab=dashboard&sub_tab=timeline`
  const fullPath = `${baseUrl}&sub_tab=timeline`

  // Find "All Data" tab
  const defaultTab = filters.find(tab => tab.label === 'All Data')?.href || ''

  // State for active label, defaulting to "All Data"
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
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider columns={columns} tab={{ name: 'New Filter' }}>
            <GridManageFilter />
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    })
  }

  return (
    <div className="p-4 ps-0 pb-0 flex flex-col gap-4">
      <div className="flex">
        <div className="h-[36px] justify-between flex gap-x-2">
          {filters.map((tab) => {
            const isActive = activeLabel === tab.href
            console.log('%c Line:74 🍆 tab', 'color:#b03734', tab)

            return (
              <Fragment key={tab.id}>
                <Button
                  aria-selected = { isActive }
                  className = "flex items-center justify-between rounded-md px-2 py-0 pr-2 text-sm"
                  role = "tab"
                  variant = "secondary"
                  onClick = { (e) => {
                    e.preventDefault()
                    handleTabClick(tab.href)
                    setFilterQuery?.(tab?.id ?? {})
                    _setRefetchTrigger(prev => prev + 1)
                  } }
                >
                  <span className={`${isActive ? 'text-primary' : 'text-gray-600'}`}>
                    {tab.label}
                  </span>
                  {tab?.label !== 'All Data' && <FilterProperty filter={tab} />}
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
