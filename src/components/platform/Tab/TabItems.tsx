'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

import { type IPropsTabList } from './type';
import { calculateMainTabItems, reorderMainTabActive, reorderShowActiveItem } from '~/utils/sort-tab-items';
import MainTabContent from './MainTabContent';
import { updateAllMaindata, updateAllMaindata2 } from './Actions/actions';
import { useIsMobile } from '~/hooks/use-mobile';
import { useSideDrawer } from '../SideDrawer';
import { Sortable, SortableItem } from '~/components/ui/sortable';
import { debounce, lowerCase, toLower } from 'lodash';
import MainTabitem from './MainTabItem';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Button } from '@headlessui/react';
import { Input } from '~/components/ui/input';
import MainDropTabItem from './MainDropTabItem';
import { id } from 'date-fns/locale';
import { current } from 'immer';


type TabItemsProps = {
  items: IPropsTabList[]
  children?: React.ReactNode
};

export interface IActions {
  closeTab: (tab: IPropsTabList) => void
  closeCurrentTab: (tab: IPropsTabList) => void
  closeAllTabs: () => void
  closeOtherTabs: (tab: IPropsTabList) => void
}

const TabItems = ({ items =[]}: TabItemsProps) => {
  const { open } = useSidebar();
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/');
  const [tablists, setTablists] = useState<any[]>(items);
  const [copyTab, setCopyTab] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(
    items?.length > 0 ? items.find((tab) => tab.current)?.id : 'dashboard',
  );

  const [isClient, setIsClient] = useState(false)
  const [application, code] = (pathname || '').split('/').slice(3)
  const  {state: drawerState,  } = useSideDrawer ()
  const {width, isOpen, isPinned} = drawerState

  const ismobile = useIsMobile()

  const conWidth = useMemo(() =>   ({
    width: `calc(100vw - ${open ? '397px' : ismobile ? '60px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);

  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);

  useEffect(() => {
    setTablists(items);
    if (items.length > 0 && !activeTab) {
      setActiveTab(items?.[0]?.id);
    }
  }, [items]);


  // Adjust sidebar width based on whether it is open or closed.
  useEffect(() => {
    setIsClient(true)
  }, [])

  const getActiveName = useMemo(() => {
    return () => {
      if (application === 'dashboard') {
        return 'dashboard'
      }
      return entity
    }
  }, [application, entity]);


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
    const calc = (params?: any[]) => {
      const allItems: any[] = [];
      const newData = params || items;

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
            router.push(href);
          }
           
        }
      }

    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tablists]);

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

  const handleRemoveTab = (tab: any) => {
    const newTablist = tablists.filter((item: any) => item.id !== tab.id)
    if(newTablist?.find((item: any) => item.current)) {
      setTablists(newTablist);
      updatecachedItems(newTablist);
    }
    else {
      newTablist[newTablist.length - 1] = {
        ...newTablist[newTablist.length - 1],
        current: true,
        is_current: true
      }
      const activeTab = newTablist[newTablist.length - 1];
      if(activeTab) {
        setActiveTab(activeTab.id);
        setTablists(newTablist);
        updatecachedItems(newTablist);
        router.push(activeTab?.href);
      }
    }    
  };

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllMaindata(items);
    } catch (error) {
      console.error(error);
    }
  };

  // Insert new tabs into the tab list.
  const insertMainTabs = async () => {
    const found = tablists.find((tab) => {
      const [, , entityName] = tab.href.split('/');
      return entityName === entity;
    });
    
    if (found) {
        const tablist = tablists.map((tab) => {
          if (tab.href === found.href) {
            return {
            ...tab,
              current: true,
              is_current: true,
            };
          }
          return {
           ...tab,
            current: false,
            is_current: false,
          }
        })

        setActiveTab(found?.id)
        setTablists(tablist);
      return;
    }
    const newTab = [
      ...tablists.map(tab=> ({...tab, current: false, is_current:false})),
      {
        name: entity,
        id: entity,
        href: pathname,
        current: true,
      },
    ]?.map((item) => {
      return {
        ...item,
        current: item.href === pathname,
      };
    }) as any[];

    setActiveTab(entity || '');
    setTablists(newTab);
    try {
      await updateAllMaindata(newTab)
      router.refresh();
    } catch (error) {
        console.error(error)
    }
  };


  const closeTab = async (tab: IPropsTabList) => {
    return null
  };
  // Close Current Tab
  // Current tab
  const closeCurrentTab = (tab: IPropsTabList) => {
    return null
  };

  // Close All tabs
  // Except dashboard

  const closeAllTabs = () => {
    const newTablist = tablists.filter((item: any) => item.id === 'dashboard' || item.name === 'dashboard')
    setTablists(newTablist);
    updatecachedItems(newTablist);
    setActiveTab('dashboard');
    router.push('/portal/dashboard');
  };

  // Close Other tabs
  const closeOtherTabs = (tab: IPropsTabList) => {
    const newTab = tablists.filter(
      (item: any) => item.name === tab?.name || item.name === 'dashboard',
    );
    const found = newTab.find((item: any) => item.current);


    if (!found) {
      newTab[newTab.length - 1] = {
        ...newTab[newTab.length - 1],
        current: true,
        is_current: true
      }
      const activeTab = newTab[newTab.length - 1];


      if(activeTab) {
        setActiveTab(activeTab.id);
        setTablists(newTab);
        updatecachedItems(newTab);
        router.push(activeTab?.href);
      }
    }   
    setTablists(newTab);
    updatecachedItems(newTab);
  }



  const actions = {
    closeTab,
    closeCurrentTab,
    closeAllTabs,
    closeOtherTabs,
    handleRemoveTab
  } as IActions;

  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
  }, 300);  // 300ms delay

  useEffect(() => {
    insertMainTabs();
  }, [entity]);

  useEffect(() => {
    if(!isDropdownOpen) {
      setSearchValue('')
    }
  }, [isDropdownOpen])

  const hasResult = useMemo(() => {
    if(tablists?.length) {
     return  Boolean(tablists?.filter((dta) => dta.hidden && (!!searchValue ? toLower(dta?.name)?.includes(toLower(searchValue)) : true ))?.length)
    } 
    return false
  }, [tablists, searchValue])

  // useEffect(() => {
  //   if (newTabList.length !== 0) {
  //     insertTabs.mutateAsync(newTabList);
  //     return;
  //   }
  // }, [newTabList]);

  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none pt-[4px] md:pt-[0] border-b md:border-b-0 border-slate-100 fixed md:static w-full top-[57px] flex justify-between gap-x-2 md:min-h-[2.0rem]  pl-0 lg:pl-0',
      )}
    >
    <>
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
            setTablists(resetOrder);
            updatecachedItems(resetOrder);
            
          }}
        >
          {tablists.map((tab: any, index: number) => {
            const isHidden = copyTab?.[index]?.hidden;

            if(lowerCase(tab.name) === 'dashboard') {
             return (
                <MainTabitem
                    className={cn({ 'opacity-0': isHidden })}
                    isHidden={isHidden}
                    ref={(el) => {
                      if (el) {
                        if (itemsRef.current) {
                          itemsRef.current[index] = el;
                        }
                      }
                    }}
                    index={index}
                    activeItem={activeTab}
                    tab={tab}
                    handleClick={handleTabClick}
                    newItems={tablists}
                    pathname={pathname}
                    key={index}
                    actions={actions}
                /> 
             )
            }

            return (
              <SortableItem key={tab.id} value={tab.id} className="relative"
              >
                <MainTabitem
                    className={cn({ 'opacity-0': isHidden })}
                    isHidden={isHidden}
                    ref={(el) => {
                      if (el) {
                        if (itemsRef.current) {
                          itemsRef.current[index] = el;
                        }
                      }
                    }}
                    activeItem={activeTab}
                    index={index}
                    handleClick={handleTabClick}
                    tab={tab}
                    newItems={tablists}
                    pathname={pathname}
                    key={index}
                    actions={actions}
                  /> 
              </SortableItem>
            );
          })}
        </Sortable>
      </div>
      {copyTab?.some((tab: any) => tab.hidden) && isWindowLoaded && (
        <>
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
                      <MainDropTabItem
                        tab={itm}
                        shownItems={tablists}
                        dropItems={copyTab?.filter((dta: any) => dta.hidden)}
                        handleClickItem={handleTabClickDropdown}
                        pathname={pathname}
                        onSelect={() => setIsDropdownOpen(false)}
                        isActive={isActive}
                        actions={actions}
                      />
                    </DropdownMenuItem>
                  );
                })}
                {!hasResult ? <div className='text-sm text-center text-default/65'>No result...</div> : null}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </>
    {/* <MainTabContent
        par_items={sortTabsActiveWillSecond}
        pathname={pathname}
        isWindowLoaded={isWindowLoaded}
        application={application}
        code={code}
        actions={actions}
        cachedItems={cachedItem}
      /> */}
    </nav>
  )
};

export default TabItems;
