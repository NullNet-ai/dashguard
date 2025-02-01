'use client'

import { Button } from '@headlessui/react'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { ArrowDownWideNarrow, XIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '~/components/ui/badge'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import useScreenType from '~/hooks/use-screen-type'

import { type IFilterBy } from '../Category/type'

import CopyButton from './CopyButton'
import GridDialog from './GridDialog'
interface IProps extends IFilterBy {
  test?: any
}
export default function ReportDropdownProperties({
  filter_by,
  filter_id,
  sort_by,
}: IProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(false)
  const screenType = useScreenType()
  const isMobile = screenType === 'sm' || screenType === 'xs'
  const closeSubmenu = () => {
    setIsSubmenuOpen(false)
  };
  return (
    <DropdownMenuSub open={isSubmenuOpen} onOpenChange={setIsSubmenuOpen}>
      <DropdownMenuSubTrigger className="flex gap-2">
        <ArrowDownWideNarrow
          className="text-defult/60 h-4 w-4"
          aria-hidden="true"
        />
        <span>Report Properties</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        sideOffset={isMobile ? -170 : undefined}
        alignOffset={isMobile ? 80 : undefined}
        className="flex flex-col p-3 px-4 text-sm"
      >
        <div className="mb-4 flex flex-row items-center justify-between">
          <h2 className="font-semibold">Report Property</h2>
          <Button
            className="hover:opacity-60"
            onClick={() => {
              closeSubmenu()
            }}
          >
            <XIcon className="text-default/60 h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-3">
          {filter_by?.converted?.length
            ? (
                <div className="flex flex-col gap-y-2">
                  <span className="text-xs text-tertiary-foreground">Filter by</span>
                  <Badge variant="outline">
                    {filter_by?.converted.map((filter, index) => {
                      return (
                        <span key={index}>
                          {filter.field_label}
                          {' '}
                          <span className="font-normal">
                            <span className="font-semibold text-blue-500">
                          &nbsp;
                              {` ${filter.operator_label} `}
&nbsp;
                            </span>
                        &nbsp;
                            {`"${filter.values}"`}
                          </span>
                        </span>
                      )
                    })}

                    <Button className="ml-2 hover:opacity-60">
                      <XIcon className="text-default/60 h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              )
            : null}
          <div className="flex flex-col gap-y-2">
            <span className="text-xs text-tertiary-foreground">Sort By</span>
            <Badge variant="outline" className="flex self-start">
              <span>Update Date (Desc)</span>
              <Button className="ml-2 hover:opacity-60">
                <XIcon className="text-default/60 h-3 w-3" />
              </Button>
            </Badge>
          </div>
          <div className="flex flex-col gap-y-2">
            <span className="text-xs text-tertiary-foreground">Group By</span>
          </div>
          <Separator />
          <div className="flex gap-x-2">
            <GridDialog
              sort_by={sort_by}
              filter_by={filter_by}
              filter_id={filter_id}
            />
            <DropdownMenuItem>
              <CopyButton filter_id={filter_id} />
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
