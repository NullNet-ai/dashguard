'use client'

import Cookies from 'js-cookie'
import { ChevronDownIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useSidebar } from '~/components/ui/sidebar'
import useWindowSize from '~/hooks/use-resize'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'
import { remToPx } from '~/utils/fetcher'

import InnerDropTabItem from './InnerDropTabItem'
import InnerTabitem from './InnerTabitem'

type InnerTabItemsProps = {
  tabs: any[]
  pathname?: string
}

const InnerTabItems = ({ tabs, pathname }: InnerTabItemsProps) => {
  const winWidth = useWindowSize().width
  const { open } = useSidebar()
  const newPathname = usePathname()
  const [application, code] = (newPathname || '').split('/').slice(3)
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)

  let sidebar_width = remToPx(open ? 16 : 5)
  const size = useScreenType()
  if (size === 'xs' || size === 'sm' || size === 'md') {
    sidebar_width = 0
  }

  useEffect(() => {
    const handleLoad = () => setIsWindowLoaded(true)

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setIsWindowLoaded(true)
      }
      else {
        window.addEventListener('load', handleLoad)
      }
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    };
  }, [])

  const sortTabsActiveWillSecond = useMemo(() => {
    if (tabs.length) {
      const activeIndex = tabs.findIndex(a => a.name === code)
      const prevCurrent = typeof window !== 'undefined' ? Cookies.get('prevCurrent') : null
      const prevActiveIndex = tabs.findIndex(a => a.name === prevCurrent)

      if (activeIndex !== -1) {
        const result = [...tabs]
        const activeTab = result.splice(activeIndex, 1)[0]
        // Handle previous active tab if exists in tabs
        if (prevActiveIndex !== -1 && prevCurrent !== code) {
          const prevActiveTab = result.splice(prevActiveIndex > activeIndex ? prevActiveIndex - 1 : prevActiveIndex, 1)[0]
          result.splice(1, 0, activeTab)
          result.splice(2, 0, prevActiveTab)
        }
        else {
          result.splice(1, 0, activeTab)
        }
        return result
      }
      return tabs
    }
    return tabs
  }, [tabs, code])

  const newItems = useMemo(() => {
    if (!winWidth) return sortTabsActiveWillSecond
    const max_width = winWidth - sidebar_width - 57
    const showItem = max_width / 88
    const sliceCount = Math.floor(showItem)

    // If clicked item is from dropdown, handle reordering
    const isFromDropdown = sortTabsActiveWillSecond.findIndex(tab => tab.name === code) >= sliceCount
    if (isFromDropdown && code) {
      // Create new array without modifying original
      const reorderedTabs = [...sortTabsActiveWillSecond]
      const clickedIndex = reorderedTabs.findIndex(tab => tab.name === code)

      // Store items we need to move
      const clickedItem = reorderedTabs[clickedIndex]
      const lastVisibleItem = reorderedTabs[sliceCount - 1]

      // Create new array with desired order
      const newOrder = [
        reorderedTabs[0],
        clickedItem,
        ...reorderedTabs.slice(1, sliceCount - 1),
        lastVisibleItem,
      ]

      return [...newOrder.slice(0, sliceCount)]
    }

    return sortTabsActiveWillSecond.slice(0, sliceCount)
  }, [sortTabsActiveWillSecond, code, winWidth, sidebar_width])

  const dropdownItems = useMemo(() => {
    if (!winWidth) return sortTabsActiveWillSecond
    const max_width = winWidth - sidebar_width - 57
    const showItem = max_width / 88
    const sliceCount = Math.floor(showItem)

    const isFromDropdown = sortTabsActiveWillSecond.findIndex(tab => tab.name === code) >= sliceCount
    if (isFromDropdown && code) {
      const visibleItems = newItems
      return sortTabsActiveWillSecond.filter(tab => !visibleItems.find(item => item.name === tab.name)
      )
    }

    return sortTabsActiveWillSecond.slice(sliceCount)
  }, [sortTabsActiveWillSecond, newItems, code, winWidth, sidebar_width])

  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false

  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide flex justify-between gap-x-2 border-b md:min-h-[2.3rem] md:mt-[-4px]  pl-0 lg:pl-0')}
    >
      <div className="flex items-center">
        {newItems.map((tab) => {
          return (
            <InnerTabitem
              tab={tab}
              newItems={newItems}
              pathname={pathname}
              key={checkIfUserRole(tab.name) ? 'role' : tab.name}
            />
          )
        })}
      </div>
      {dropdownItems.length > 0 && isWindowLoaded && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary"
            data-test-id="apptab-ddn-btn"
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            {dropdownItems.map((tab) => {
              const isGrid = tab.name === 'Grid' || tab.name === 'grid'
              const isGridActive = application === 'Grid' || application === 'grid'
              const isActive = isGridActive ? !!isGrid : code === tab?.name
              return (
                <DropdownMenuItem
                  key={checkIfUserRole(tab.name) ? 'role' : tab.name}
                  className="group relative flex items-center p-2 py-3"
                >
                  <InnerDropTabItem
                    tab={tab}
                    dropItems={dropdownItems}
                    pathname={pathname}
                    isActive={isActive}
                  />
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  )
};

export default InnerTabItems
