'use client'

import Cookies from 'js-cookie'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { reorderItems, reorderShowActiveItem } from '~/utils/sort-tab-items'

import InnerTabsContent from './InnerTabsContent'
import { api } from '~/trpc/react'
import useWindowSize from '~/hooks/use-resize'

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
  const {width} = useWindowSize();
  const [newtabs, setNewtabs] = useState<any>([])

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
    if (!isClient) {
      return tabs?.map(tab => ({...tab, id: tab?.name}))
    }

    if (tabs.length) {

      const newTabs = tabs?.map(tab => ({...tab, id: tab?.name}))
      const activeItem = newTabs.find(a => a.name === code)
      const copiedItem: any[] = cachedItem?.tabs?.length  ? cachedItem?.tabs :  newTabs || []
      const result =  reorderShowActiveItem(copiedItem, code ?? '', application ?? '')
      return result
      
    }
    return tabs?.map(tab => ({...tab, id: tab?.name})).filter(Boolean)
  }, [tabs, code, isClient, cachedItem, width])
  

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
