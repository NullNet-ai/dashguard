'use client'
import { Copy, Grid, MoreVertical, Trash2 } from 'lucide-react'
import React from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

import { columns } from './components/GroupFilterSideDrawer/config'
import { ManageFilterProvider } from './components/GroupFilterSideDrawer/Provider'
import GridManageFilter from './components/GroupFilterSideDrawer/View'
import { useFilter } from './FilterProvider'

export default function FilterProperty({ filter, filter_type }: { filter: any, filter_type: string }) {
  const { actions: sideDrawerActions } = useSideDrawer()
  const { openSideDrawer } = sideDrawerActions
  const { actions, state: filterState } = useFilter()
  const { filters = [] } = filterState ?? {}

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      // title: 'Manage Filter',
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            columns= { columns }
            filter_type= { filter_type }
            tab={filter }
            existingFilters={filters}
          >
            <GridManageFilter filter_type={filter_type} />
          </ManageFilterProvider>
        ),
        componentProps: {},
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild = { true }>
        <Button variant="ghost" className="!px-0 !bg-transparent">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-max">
        <DropdownMenuItem onClick={handleOpenSideDrawer}>
          <Grid className="mr-2 h-4 w-4" color="#a0aec0" />
          {"Manage Filter"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions?.handleDuplicateTab({ ...filter, name: `${filter.name} copy` })}>
          <Copy className="mr-2 h-4 w-4" color="#a0aec0" />
          {"Duplicate Filter"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions?.handleDelete({ id: filter.id })}>
          <Trash2 className="mr-2 h-4 w-4" color="#a0aec0" />
          {"Delete Filter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
