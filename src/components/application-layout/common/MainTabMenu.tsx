'use client'

import { lowerCase } from 'lodash';
import { EllipsisVertical, FileX, FileX2, StarIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'

const MainTabMenu = ({
  current,
  href,
  tab,
  tabs,
  name,
  entity,
  actions,
}: {
  current: boolean
  href: string
  tabs: any
  name: string
  entity: string
  actions?: any
  tab: any
}) => {
  if (name === 'Grid') return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2  py-1.5 text-left text-sm opacity-1 lg:opacity-0 group-hover:opacity-100 cursor-pointer">
          <EllipsisVertical
            className="h-3.5 w-3.5 font-semibold text-default/60 cursor-pointer"
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className="relative flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()
            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return lowerCase(tab.name) !== lowerCase(name)
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              main_tab_data: {
                ...cachedItems?.main_tab_data,
                tabs: newItems,
              }
            }))
            // actions?.closeTab(tab)
            actions?.handleRemoveTab(tab)

          }}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()

            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return   lowerCase(tab.name) === lowerCase(name) || lowerCase(tab.name) === 'grid'
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              main_tab_data: {
                ...cachedItems?.main_tab_data,
                tabs: newItems,
              }
            }))

            actions?.closeOtherTabs(tab)

          }}
        >
          <FileX2 className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2 cursor-pointer"
          onSelect={(event) => {
            event.preventDefault()

            const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
            const newItems = tabs.filter((tab: any) => {
              return  lowerCase(tab.name) === 'grid'
            })

            localStorage.setItem('cachedPortalItems', JSON.stringify({
              ...cachedItems,
              main_tab_data: {
                ...cachedItems?.main_tab_data,
                tabs: newItems,
              }
            }))

            actions?.closeAllTabs(tab)
          }}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close All Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2 cursor-pointer">
          <StarIcon className="h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
};

export default MainTabMenu
