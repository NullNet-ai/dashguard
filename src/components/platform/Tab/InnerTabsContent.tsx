'use client'

import Cookies from 'js-cookie'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

import InnerDropTabItem from './InnerDropTabItem'
import InnerTabitem from './InnerTabitem'
import { useSideDrawer} from '~/components/platform/SideDrawer/SideDrawerProvider'; 

const InnerTabsContent = ({
  par_items = [],
  pathname,
  isWindowLoaded,
  application,
  code,
}: any) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<any[]>([])
  const [data, setData] = useState<any[]>([])
  const { open } = useSidebar()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const  {state: drawerState,  } = useSideDrawer ()

  const {width, isOpen, isPinned} = drawerState

  //remove px and parse to interger and add 20 then add px


  const conWidth = useMemo(() => ({
    width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);

  useEffect(() => {
    const calc = (items?: any[]) => {
      const allItems: any[] = []
      const newData = items || par_items
      // clear width, more width, and search by
      let totalWidth = 0
      const containerWidth = parentRef.current?.offsetWidth || 0

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0
          totalWidth += 8
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
            })
          }
          else {
            allItems?.push({
              ...newData[index],
              hidden: false,
            })
          }
        }
      }
      return allItems
    }

    const handleResize = () => {
      const items = calc()

      if (JSON.stringify(items) !== JSON.stringify(data)) {
        setData(items)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [par_items, parentRef?.current?.offsetWidth, drawerState])

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>
    const handleResize = () => {
      // Clear any existing timeout to prevent multiple executions
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        if (data?.length) {
          Cookies.set('innerCopiedLastItems', JSON.stringify(data))
        }
      }, 1000)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      window.removeEventListener('resize', handleResize)
    };
  }, [])

  const lastShownItem = useMemo(() => {
    if (data?.length > 0) {
      const removeHidden = data.filter((item: any) => !item.hidden)
      const lastItem = removeHidden[removeHidden.length - 1]
      return lastItem
    }
  }, [data])

  return (
    <>
      <div
        ref={parentRef}
        className={cn(
          `flex items-center`, `overflow-hidden`,
        )}
        style={conWidth}
      >
        {par_items.map((tab: any, index: number) => {
          const isHidden = data?.[index]?.hidden
          return (
            <InnerTabitem
              className={cn({ 'opacity-0': isHidden })}
              isHidden={isHidden}
              ref={(el) => {
                if (el) {
                  if (itemsRef.current) {
                    itemsRef.current[index] = el
                  }
                }
              }}
              lastShownItem={lastShownItem}
              index={index}
              tab={tab}
              newItems={data}
              pathname={pathname}
              key={index}
            />
          )
        })}
      </div>
      {!!data?.length && data.some(item => item.hidden) && isWindowLoaded && (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger
            className="flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary"
            data-test-id="apptab-ddn-btn"
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className=""
            align='end'
            alignOffset={10}
            side='bottom'
          >
            {data?.filter(dta => dta.hidden).map((itm) => {
              const isGrid = itm.name === 'Grid' || itm.name === 'grid'
              const isGridActive
                = application === 'Grid' || application === 'grid'
              const isActive = isGridActive ? !!isGrid : code === itm?.name

              if (!itm.hidden) {
                return null
              }

              return (
                <DropdownMenuItem
                  key={itm.name}
                  className="group relative flex items-center p-2 py-3"
                >
                  <InnerDropTabItem
                    tab={itm}
                    shownItems={data}
                    dropItems={data?.filter(dta => dta.hidden)}
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
    </>
  )
}

export default InnerTabsContent
