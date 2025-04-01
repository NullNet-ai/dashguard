
'use client'
import { cn } from '~/lib/utils';
import { Button } from '@headlessui/react';
import CreateNewFilter from '../CreateNewFilter';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Sortable, SortableItem } from '~/components/ui/sortable';
import GridTabItem from './GridtabItem';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { debounce, toLower } from 'lodash';
import GridtabDropItem from './GridtabDropItem';
import GridTabContent from './GridTabContent';
import useWindowSize from '~/hooks/use-resize';
import { reorderGridTabActive, reorderShowActiveItem } from '~/utils/sort-tab-items';
import { useSidebar } from '~/components/ui/sidebar';

const GridTabLists = ({tabs}: {
    tabs: any[]
}) => {

    const pathname = usePathname()
    const [portal, entity, application, code] = (pathname || '').split('/').slice(1)
    const [isWindowLoaded, setIsWindowLoaded] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const {width} = useWindowSize();
    const [cachedItem, setCachedItem] = useState<any>({})


 // window load
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
       
        if(!isClient) {
          setCachedItem(tabs)
        }

        const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
        const selectedCached = cachedItems?.[`grid_tab_${entity}`]

        if(tabs?.length !== selectedCached?.tabs?.length || 
          (selectedCached?.tabs?.length && JSON.stringify(selectedCached?.tabs) !== JSON.stringify(tabs))
        ) {
            //save to localstorage
            localStorage.setItem('cachedPortalItems', JSON.stringify({
                ...cachedItems,
                [`grid_tab_${entity}`]: {
                  ...cachedItems[`grid_tab_${entity}`],
                  tabs: tabs,
                }
            }))
        }
        setCachedItem(cachedItems?.[`grid_tab_${entity}`])
      }, [code, isClient, tabs])


      const sortTabsActiveWillSecond = useMemo(() => {
        if (!isClient) {
          return tabs
        }

        if (tabs?.length) {
    
          const newTabs = tabs
          const activeItem = newTabs.find(a =>  a.current)
          const isSameItems = JSON.stringify(newTabs) === JSON.stringify(cachedItem?.tabs)

          const copiedItem = (newTabs?.length !== cachedItem?.tabs?.length || !isSameItems) ? newTabs : cachedItem?.tabs?.length ? cachedItem?.tabs : [];

          const result =  reorderGridTabActive(copiedItem, activeItem?.id ?? '', application ?? '')
          return result
          
        }
        return tabs;
      }, [tabs, code, isClient, cachedItem, width])
      

      useEffect(() => {
        setIsClient(true)
      }, [])
      
    return (
        <div
            aria-label="Tabs"
            className={cn('grid-tab-list flex flex-1 w-full justify-between',
            )}
        >
            <GridTabContent
                par_items={sortTabsActiveWillSecond}
                pathname={pathname}
                isWindowLoaded={isWindowLoaded}
                application={application}
                code={code}
                cachedItems={cachedItem}
            />
      </div>
    )
}


export default GridTabLists