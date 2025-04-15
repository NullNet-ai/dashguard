'use client'

import { lowerCase } from 'lodash';
import { EllipsisVertical, FileX, FileX2, StarIcon } from 'lucide-react'

import {
  closeAllInnerClassTabs,
  closeInnerClassTab,
  closeOtherInnerClassTabs,
} from '~/components/platform/Tab/Actions/InnerTabActions'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'
import { testIDFormatter } from '~/utils/formatter';

const TabMenu = ({
  current,
  href,
  tabs,
  name,
  entity
}: {
  current: boolean
  href: string
  tabs: any
  name: string
  entity: string
}) => {
  if (name === 'Grid') return null
  return (
    <DropdownMenu data-test-id={testIDFormatter(`${entity}-tab-menu`)}>
      <DropdownMenuTrigger asChild>
        <div 
          className="flex items-center gap-2 py-1.5 pr-[2px] text-left text-sm opacity-1 lg:opacity-0 group-hover:opacity-100 cursor-pointer" 
          data-test-id={testIDFormatter(`${entity}-tab-menu-trigger`)}
        >
          <EllipsisVertical
            className="h-3.5 w-3.5 font-semibold text-default/60 cursor-pointer"
            aria-hidden="true"
            data-test-id={testIDFormatter(`${entity}-tab-menu-trigger-icon`)}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start"
        data-test-id={testIDFormatter(`${entity}-tab-menu-content`)}
      >
        <DropdownMenuItem
          className="relative flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            void closeInnerClassTab({
              pathname: href,
              current,
              tabs,
            })
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-tab`)}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            void closeOtherInnerClassTabs({
              pathname: href,
              current,
              tabs,
            })
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-other-tabs`)}
        >
          <FileX2 className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            void closeAllInnerClassTabs({
              pathname: href,
              current,
              tabs,
            })
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-all-tabs`)}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close All Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator 
          data-test-id={testIDFormatter(`${entity}-tab-menu-separator`)} 
        />
        <DropdownMenuItem 
          className="flex gap-2"
          data-test-id={testIDFormatter(`${entity}-tab-menu-add-favorites`)}
        >
          <StarIcon className="h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
};

export default TabMenu
