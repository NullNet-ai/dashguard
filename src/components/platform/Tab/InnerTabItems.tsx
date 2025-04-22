'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'

import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { calculateMainTabItems, reorderItems, reorderShowActiveItem } from '~/utils/sort-tab-items'

import InnerTabsContent from './InnerTabsContent'
import { api } from '~/trpc/react'
import useWindowSize from '~/hooks/use-resize'
import { useSideDrawer } from '../SideDrawer'
import { Sortable, SortableItem } from '~/components/ui/sortable'
import { updateAllInnerdata, updateAllMaindata } from './Actions/actions'
import { debounce, lowerCase, toLower } from 'lodash'
import InnerTabitem from './InnerTabitem'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { ChevronDownIcon, Search, X } from 'lucide-react'
import { Button } from '@headlessui/react'
import { Input } from '~/components/ui/input'
import InnerDropTabItem from './InnerDropTabItem'

type InnerTabItemsProps = {
  tabs: any[]
  pathname?: string
  variant?: 'drawer' | 'dropdown'
} 

const InnerTabItems = ({ tabs, pathname, variant }: InnerTabItemsProps ) => {
  const { isBannerPresent } = useSidebar()
  const newPathname = usePathname()
  const [cachedItem, setCachedItem] = useState<any>({})
  const { open } = useSidebar();
  const router = useRouter();
  const [portal, entity, application, code] = (newPathname || '').split('/').slice(1)
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const {width: winWidth} = useWindowSize();
  const [tablists, setTablists] = useState<any[]>(tabs);
  const [copyTab, setCopyTab] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('')
  const  {state: drawerState,  } = useSideDrawer ()
  const {width, isOpen, isPinned} = drawerState as any
  const [activeTab, setActiveTab] = useState<string>(
    tabs?.length > 0 ? tabs.find((tab) => tab.current)?.id : 'dashboard',
  );

  const conWidth = useMemo(() =>   ({
    width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);

  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);

  useEffect(() => {
    // Only update tablists if they're different from current state
    if (JSON.stringify(tablists) !== JSON.stringify(tabs)) {
      setTablists(tabs);
    }
    
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs?.[0]?.id);
    }
  }, [tabs]);


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
    const calc = (params?: any[]) => {
      const allItems: any[] = [];
      const newData = params || tabs;

      // clear width, more width, and search by
      let totalWidth = 0;
      const containerWidth = parentRef.current?.offsetWidth || 0;

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0;
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
              order: index,
              metadata: {
                item_width: itemsRef.current[index].offsetWidth || 0,
              },
            });
          } else {
            allItems?.push({
              ...newData[index],
              hidden: false,
              order: index,
              metadata: {
                item_width: itemsRef.current[index].offsetWidth || 0,
              },
            });
          }
        }
      }
      const result = calculateMainTabItems(allItems, containerWidth, '')

      return result;
    };

    const handleResize = () => {  
      const items = calc(tablists);
      setCopyTab(items);

      if(JSON.stringify(tablists) !== JSON.stringify(items)) {
        if(items?.length) {
          // setTablists(items);
          updatecachedItems(items);
          if(activeTab) {
            const href= items?.find((item) => item.current)?.href;
            // router.push(href);
          }
           
        }
      } else {
        updatecachedItems(items);
        if(activeTab) {
          const href= items?.find((item) => item.current)?.href;
          router.push(href);
        }
      }

    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tablists]);


  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
  }, 300);  // 300ms delay

  useEffect(() => {
    if(!isDropdownOpen) {
      setSearchValue('')
    }
  }, [isDropdownOpen])


  const updatecachedItems = async (items: any) => {
    try {
      await updateAllInnerdata(items, `/${portal}/${entity}`)
    } catch (error) {
      console.error(error);
    }
  };

  const hasResult = useMemo(() => {
    if(tablists?.length) {
     return  Boolean(tablists?.filter((dta) => dta.hidden && (!!searchValue ? toLower(dta?.name)?.includes(toLower(searchValue)) : true ))?.length)
    } 
    return false
  }, [tablists, searchValue])

  // actions
  const handleTabClick = (selectedTab: any) => {

    setActiveTab(selectedTab.id);
    const newTablist = tablists.map((tab: any) => {
      return {
        ...tab,
        current: tab.id === selectedTab.id,
        is_current: tab.id === selectedTab.id,
      };
    });

    setTablists(newTablist);
  };

  const handleTabClickDropdown = (selectedTab: any) => {
    setActiveTab(selectedTab.id);
    const newTablist = tablists.map((tab: any) => {
      const { fromDropdown, ...rest } = tab;
      return {
        ...rest,
        current: tab.id === selectedTab.id,
        ...(tab.id === selectedTab.id && { fromDropdown: true }),
        is_current: tab.id === selectedTab.id,
      };
    });

    setTablists(newTablist);
  };


  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none  fixed md:static w-full top-[89px] flex justify-between gap-x-2 border-b md:min-h-[2.3rem]  pl-0 lg:pl-0', isBannerPresent ? 'mt-12 md:mt-7' : 'md:mt-[-4px]',
      )}
    >
        <div
        ref={parentRef}
        className={cn(
          `flex items-center`, `overflow-hidden`,
        )}
        style={conWidth}
      >
        <Sortable
          orientation="horizontal"
          value={tablists}
          onMove={({ activeIndex, overIndex }) => {
            const newTablists = [...tablists];
            const [removed] = newTablists.splice(activeIndex, 1);
            newTablists.splice(overIndex, 0, removed);

            const resetOrder = newTablists.map((tab, index) => {
              return { ...tab, order: index };
            });
            updatecachedItems(resetOrder);
            setTablists(resetOrder);
            
          }}
        >
          {tablists.map((tab: any, index: number) => {
            const isHidden = copyTab?.[index]?.hidden;

            if(lowerCase(tab.name) === 'dashboard') {
              return (
                <InnerTabitem
                  className={cn({ 'opacity-0': isHidden })}
                  isHidden={isHidden}
                  ref={(el) => {
                    if (el) {
                      if (itemsRef.current) {
                        itemsRef.current[index] = el;
                      }
                    }
                  }}
                  handleClick={handleTabClick}
                  index={index}
                  tab={tab}
                  newItems={tablists}
                  pathname={pathname}
                  key={index}
                /> 
              )
            }
            return (
              <SortableItem key={tab.id} value={tab.id} className="relative">
                <InnerTabitem
                    className={cn({ 'opacity-0': isHidden })}
                    isHidden={isHidden}
                    handleClick={handleTabClick}
                    ref={(el) => {
                      if (el) {
                        if (itemsRef.current) {
                          itemsRef.current[index] = el;
                        }
                      }
                    }}
                    index={index}
                    tab={tab}
                    newItems={tablists}
                    pathname={pathname}
                    key={index}
                  /> 
              </SortableItem>
            );
          })}
        </Sortable>
      </div>
      {copyTab?.some((tab: any) => tab.hidden) && isWindowLoaded && (
        <>
          {variant === 'dropdown' ? (
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
            <DropdownMenuContent align='end' alignOffset={5}>
              <div className='p-2 pb-3 flex flex-row justify-between min-w-[265px]'>
                <h3 className='text-base text-default/90'>Open Tabs</h3>
                <Button
                  onClick={() => {
                    setIsDropdownOpen(false)
                  }}
                  className='text-default/60 hover:opacity-30 transition-opacity duration-200'>
                    <X className='size-4'/>
                </Button>
              </div>

              <div className='p-2'>
                <Input Icon={Search}
                  iconPlacement='left'
                  iconClassName='size-4'
                  placeholder='Search...'
                  onChange={handleSearch}
                />
              </div>
              <div className="max-h-[calc(100vh-209px)] overflow-y-auto my-2">
              {copyTab
                ?.filter((dta) => dta.hidden && (!!searchValue ? toLower(dta?.name)?.includes(toLower(searchValue)) : true ) )
                .map((itm) => {
                  const isGrid = itm.name === 'Grid' || itm.name === 'grid';
                  const isGridActive =
                    application === 'Grid' || application === 'grid';
                  const isActive = isGridActive ? !!isGrid : code === itm?.name;
  
                  if (!itm.hidden) {
                    return null;
                  }
  
                  return (
                    <DropdownMenuItem
                      key={itm.name}
                      className="group relative flex items-center py-1 justify-between"
                    >
                      <InnerDropTabItem
                        tab={itm}
                        onClickItem={handleTabClickDropdown}
                        shownItems={tablists}
                        dropItems={copyTab?.filter((dta: any) => dta.hidden)}
                        pathname={pathname}
                        onSelect={() => setIsDropdownOpen(false)}
                        isActive={isActive}
                      />
                    </DropdownMenuItem>
                  );
                })}
                {!hasResult ? <div className='text-sm text-center text-default/65'>No result...</div> : null}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          ) : ''
          }
        </>
      )}

    </nav>
  )
};

export default InnerTabItems
