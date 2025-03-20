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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 py-1.5 pr-[2px] text-left text-sm opacity-1 lg:opacity-0 group-hover:opacity-100 cursor-pointer">
          <EllipsisVertical
            className="h-3.5 w-3.5 font-semibold text-default/60 cursor-pointer"
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className="relative flex gap-2"
          onSelect={(event) => {
            event.preventDefault()
            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return lowerCase(tab.name) !== lowerCase(name)
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              [`inner_tab_data_${entity}`]: {
                ...cachedItems[`inner_tab_data_${entity}`],
                tabs: newItems,
              }
            }))
         
            void closeInnerClassTab({
              pathname: href,
              current,
              tabs,
            })
          }}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2"
          onSelect={(event) => {
            event.preventDefault()

            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return   lowerCase(tab.name) === lowerCase(name) || lowerCase(tab.name) === 'grid'
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              [`inner_tab_data_${entity}`]: {
                ...cachedItems[`inner_tab_data_${entity}`],
                tabs: newItems,
              }
            }))

            void closeOtherInnerClassTabs({
              pathname: href,
              current,
              tabs,
            })
          }}
        >
          <FileX2 className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2"
          onSelect={(event) => {
            event.preventDefault()

            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return  lowerCase(tab.name) === 'grid'
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              [`inner_tab_data_${entity}`]: {
                ...cachedItems[`inner_tab_data_${entity}`],
                tabs: newItems,
              }
            }))

            void closeAllInnerClassTabs({
              pathname: href,
              current,
              tabs,
            })
          }}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close All Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2">
          <StarIcon className="h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
};

export default TabMenu
