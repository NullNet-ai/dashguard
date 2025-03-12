'use client'

import Cookies from 'js-cookie'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { reorderItems } from '~/utils/sort-tab-items'

import InnerTabsContent from './InnerTabsContent'
import { api } from '~/trpc/react'

type InnerTabItemsProps = {
  tabs: any[]
  pathname?: string
  variant?: 'drawer' | 'dropdown'
} 

const InnerTabItems = ({ tabs, pathname, variant }: InnerTabItemsProps ) => {
  const { isBannerPresent } = useSidebar()
  const newPathname = usePathname()
  const [cachedItem, setCachedItem] = useState<any>({})
  
  const [portal, entity, application, code] = (newPathname || '').split('/').slice(1)
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

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

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if(!isClient) {
      setCachedItem(tabs)
    }
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
    setCachedItem(cachedItems?.[`inner_tab_data_${entity}`])
  }, [code, isClient, tabs])
  

  const sortTabsActiveWillSecond = useMemo(() => {
    if (!isClient) return tabs

    if (tabs.length) {

      const activeIndex = tabs.findIndex(a => a.name === code)
      const activeItem = tabs.find(a => a.name === code)
      console.log("tabxxs", activeItem)

      const prevCurrent = cachedItem?.prevCurrent
      console.log("prevCurrent", prevCurrent)
      // const copiedItem = JSON.parse(Cookies.get('innerCopiedLastItems') || '[]')

      
      const copiedItem: any[] = cachedItem?.tabs || []
      console.log("copiedItem", copiedItem)
      // const copiedItem: any[] = []
      const prevActiveIndex = tabs.findIndex(a => a.name === prevCurrent)
      const prevActiveItem = tabs.find(a => a.name === prevCurrent)
      if (copiedItem?.length) {
        const result = reorderItems(copiedItem, prevActiveItem, activeItem?.name)
        return result.filter(Boolean)
      }

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

        return result.filter(Boolean)
      }

      return tabs.filter(Boolean)
    }
    return tabs.filter(Boolean)
  }, [tabs, code, isClient, cachedItem])

  

  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none  fixed md:static w-full top-[89px] flex justify-between gap-x-2 border-b md:min-h-[2.3rem]  pl-0 lg:pl-0', isBannerPresent ? 'mt-12 md:mt-7' : 'md:mt-[-4px]',
      )}
    >
      <InnerTabsContent
        par_items={sortTabsActiveWillSecond}
        pathname={pathname}
        isWindowLoaded={isWindowLoaded}
        application={application}
        code={code}
        cachedItems={cachedItem}
        variant={variant}
      />

    </nav>
  )
};

export default InnerTabItems
