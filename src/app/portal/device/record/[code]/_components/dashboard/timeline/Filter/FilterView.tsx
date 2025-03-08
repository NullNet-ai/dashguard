'use client'
import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { Fragment, useContext } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'

import { ManageFilterProvider } from './components/SideDrawer/Provider'
import GridManageFilter from './components/SideDrawer/View'
import FilterProperty from './FilterProperty'
import { FilterContext } from './FilterProvider'
import { usePathname } from 'next/navigation'
import { columns } from './components/SideDrawer/config'
import Link from 'next/link'
import { getTabStyles } from '~/components/platform/LinkTab/tabStyles'
import { useLinkTab } from '~/components/platform/LinkTab/Provider'
import { Button } from '~/components/ui/button'

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
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">

      <div className="flex mb-2">
        <div className="h-[36px] justify-between flex gap-x-2">

       
       {filters.map((tab) => {
        console.log("%c Line:57 🍇 tab", "color:#2eafb0", tab);
          const isActive = fullPath === tab.href;
          const tabStyles = getTabStyles("horizontal", "");
          const variant = "default";
          const size = "sm";
          return (
            <Fragment key={tab.id}>
              <Button
                // href={tab.href}
                role="tab"
                aria-selected={isActive}
                onClick={(e) => {
                    e.preventDefault();
                }}
                // className={tabStyles.tab(isActive, variant, size)}
                variant="secondary"
                className="flex items-center justify-between rounded-md px-2 py-0 pr-2 text-sm"
              >
                <span>{tab.label}</span>
                {tab?.label !== 'All Data' && <FilterProperty filter={tab} />}
              </Button>
            </Fragment>
          );
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
