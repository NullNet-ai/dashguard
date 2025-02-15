'use client'

import Cookies from 'js-cookie'
import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const isDropdown = searchParams.get('dropdown') === 'true'

  const [application, code] = (newPathname || '').split('/').slice(3)
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  // Add this state to handle client-side rendering
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const sortTabsActiveWillSecond = useMemo(() => {
    if (!isClient) return tabs
    if (tabs.length) {
      const activeIndex = tabs.findIndex(a => a.name === code)
      const prevCurrent = Cookies.get('prevCurrent')
      const prevActiveIndex = tabs.findIndex(a => a.name === prevCurrent)

      if (activeIndex !== -1) {
        const result = [...tabs]
        const activeTab = result.splice(activeIndex, 1)[0]
        if (prevActiveIndex !== -1 && prevCurrent !== code) {
          const prevActiveTab = result.splice(prevActiveIndex > activeIndex ? prevActiveIndex - 1 : prevActiveIndex, 1)[0]
          result.splice(1, 0, activeTab)
          result.splice(2, 0, prevActiveTab)
        }
        else {
          result.splice(1, 0, activeTab)
        }

        if (isDropdown) {
          const lastItem = Cookies.get('lastInnerTabItem')
          const lastItemIndex = result.findIndex(a => a.name === lastItem)

          if (lastItemIndex !== -1) {
            const itemValue = result[lastItemIndex]
            result.splice(lastItemIndex, 1)
            result.push(itemValue)
          }
        }

        return result
      }

      return tabs
    }
    return tabs
  }, [tabs, code, isClient])

  const newItems = useMemo(() => {
    if (!isClient || !winWidth) return sortTabsActiveWillSecond
    const max_width = winWidth - sidebar_width - 57
    const showItem = max_width / 98
    const result = sortTabsActiveWillSecond.slice(0, Math.floor(showItem))
    const lastItem = result[result.length - 1]
    Cookies.set('lastInnerTabItem', lastItem.name)

    return result
  }, [sortTabsActiveWillSecond, code, winWidth, sidebar_width])

  const dropdownItems = useMemo(() => {
    if (!winWidth) return sortTabsActiveWillSecond
    const max_width = winWidth - sidebar_width - 57
    const showItem = max_width / 98

    return sortTabsActiveWillSecond.slice(Math.floor(showItem))
  }, [sortTabsActiveWillSecond, code, winWidth, sidebar_width])

  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false

  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none  fixed md:static w-full top-[89px] md:top-[unset] flex justify-between gap-x-2 border-b md:min-h-[2.3rem] md:mt-[-4px]  pl-0 lg:pl-0')}
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
        <DropdownMenu
          open={isDropdownOpen} 
          onOpenChange={setIsDropdownOpen}
        >
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
                    onSelect={() => setIsDropdownOpen(false)}
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
