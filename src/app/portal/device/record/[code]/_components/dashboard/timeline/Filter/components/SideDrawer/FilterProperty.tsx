'use client'
import { Copy, Grid, MoreVertical, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '~/components/ui/button'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import useScreenType from '~/hooks/use-screen-type'

export default function ReportDropdownProperties() {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(false)
  const screenType = useScreenType()
  const isMobile = screenType === 'sm' || screenType === 'xs'
  const closeSubmenu = () => {
    setIsSubmenuOpen(false)
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild = { true }>
        <Button size = "icon" variant = "ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
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
