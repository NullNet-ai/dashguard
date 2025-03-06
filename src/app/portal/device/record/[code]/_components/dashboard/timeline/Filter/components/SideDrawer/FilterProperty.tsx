'use client'
import { Copy, Grid, MoreVertical, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import useScreenType from '~/hooks/use-screen-type'

import { ManageFilterProvider } from './Provider'
import GridManageFilter from './View'

export default function ReportDropdownProperties() {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(false)
  const screenType = useScreenType()
  const isMobile = screenType === 'sm' || screenType === 'xs'
  const closeSubmenu = () => {
    setIsSubmenuOpen(false)
  }

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
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          {"Duplicate Filter"}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Trash2 className="mr-2 h-4 w-4 text-red-500" />
          {"Delete Filter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
