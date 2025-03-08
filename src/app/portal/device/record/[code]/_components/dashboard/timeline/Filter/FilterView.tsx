'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useContext } from 'react'

import { useLinkTab } from '~/components/platform/LinkTab/Provider'
import { getTabStyles } from '~/components/platform/LinkTab/tabStyles'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import { columns } from './components/SideDrawer/config'
import { ManageFilterProvider } from './components/SideDrawer/Provider'
import GridManageFilter from './components/SideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'

const FilterView = () => {
  const { state } = useContext(FilterContext)

  const { filters = [] } = state ?? {}
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions

  const pathName = usePathname()
  const baseUrl = `${pathName}?current_tab=dashboard&sub_tab=timeline`
  const handleOpenSideDrawer = () => {
    openSideDrawer({
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            columns = {columns}
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
  const fullPath = `${baseUrl}&sub_tab=timeline`

  return (
    <div className="p-4 ps-0 pb-0 flex flex-col gap-4">

      <div className="flex">
        <div className="h-[36px] justify-between flex gap-x-2">

          {filters.map((tab) => {
            const isActive = fullPath === tab.href
            const tabStyles = getTabStyles('horizontal', '')
            const variant = 'default'
            const size = 'sm'
            return (
              <Fragment key={tab.id}>
                <Button
                // href={tab.href}
                  aria-selected = { isActive }
                  className = "flex items-center justify-between rounded-md px-2 py-0 pr-2 text-sm"
                  onClick = { (e) => {
                    e.preventDefault()
                }}
                  // className={tabStyles.tab(isActive, variant, size)}
                  role = "tab"
                  variant = "secondary"
                >
                  <span>{tab.label}</span>
                  {tab?.label !== 'All Data' && <FilterProperty filter={tab} />}
                </Button>
              </Fragment>
            )
          })}
          <button className="flex min-w-8 items-center justify-between rounded-md px-3 py-0 pr-1 text-sm" onClick={handleOpenSideDrawer}>
            <PlusCircleIcon className="h-5 w-5 mr-2 text-primary" />
          </button>
        </div>
      </div>

    </div>
  )
}

export default FilterView
