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
  const { actions } = useFilter()

  const handleOpenSideDrawer = () => {
    openSideDrawer({
      title: 'Manage Filter',
      header: <h1>Manage Filter</h1>,
      sideDrawerWidth: '1000px',
      body: {
        component: () => (
          <ManageFilterProvider
            columns= { columns }
            filter_type= { filter_type }
            tab={filter }
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
        <Button size = "icon" variant = "ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleOpenSideDrawer}>
          <Grid className="mr-2 h-4 w-4" />
          {"Manage Filter"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions?.handleDuplicateTab({ ...filter, name: `${filter.name} copy` })}>
          <Copy className="mr-2 h-4 w-4" />
          {"Duplicate Filter"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions?.handleDelete({ id: filter.id })}>
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          {"Delete Filter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
