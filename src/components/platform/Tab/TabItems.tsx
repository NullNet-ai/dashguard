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
  const winWidth = useWindowSize().width;
  const contRef = React.useRef<HTMLDivElement>(null);
  const { open } = useSidebar();
  const screenSize = useScreenType();
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/');
  const insertTabs = api.tab.insertMainTabs.useMutation();
  const [tablists, setTablists] = useState<any>(items);
  const [copyTab, setCopyTab] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>(
    items?.length > 0 ? items.find((tab) => tab.current)?.id : 0,
  );
  const [cachedItem, setCachedItem] = useState<any>({})
  const [isClient, setIsClient] = useState(false)
  const [application, code] = (pathname || '').split('/').slice(3)
  const { isBannerPresent } = useSidebar()
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

  // useEffect(() => {
  //   if(!isClient) {
  //     setCachedItem(items)
  //   }
  //   const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

  //   const selectedCached = cachedItems?.main_tab_data
  //   const notEqual = JSON.stringify(selectedCached?.tabs || [] ) !== JSON.stringify(newTabList)
    

  //   if(!selectedCached?.tabs?.length || notEqual) {
  //     const getCurrent = getActiveName() || ''

  //     const cachedData = {
  //       tabs:  items?.map(tab => ({...tab, id: tab?.name})),
  //       prevCurrent: getCurrent,
  //       key:  'main_tab_data',
  //     }


  //     const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
  
  //     localStorage.setItem('cachedPortalItems', JSON.stringify({
  //       ...cachedItems,
  //       [`main_tab_data`]: cachedData,
  //     }))
  //   }

  //   setCachedItem(selectedCached)
  // }, [code, isClient, items, newTabList])
  
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
        setTablists(items);
      }

      updatecachedItems(items);
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
    // router.push(selectedTab.href);
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
    const newTablist = tablists.filter((item: any) => item.id !== tab.id);
    setTablists(newTablist);
  };

  const updatecachedItems = async (items: any) => {
    console.log("update cached")
    try {
      await updateAllMaindata(items);
    } catch (error) {
      console.error(error);
    }
  };


  // const sortTabsActiveWillSecond = useMemo(() => {
  //   if (!isClient) {
  //     return items?.map(tab => ({...tab, id: tab?.name}))
  //   }

  //   if (items.length) {

  //     const newTabs = items?.map(tab => ({...tab, id: tab?.name}))
  //     const activeItem = newTabs.find(a => a.name === entity)
  //     const copiedItem = newTabs?.length > cachedItem?.tabs?.length ? newTabs : cachedItem?.tabs?.length ? cachedItem?.tabs : [];
  //     const result =  reorderMainTabActive(newTabs, activeItem?.name || 'dashboard', entity ?? 'dashboard')

  //     return result
      
  //   }
  //   return items?.map(tab => ({...tab, id: tab?.name})).filter(Boolean)
  // }, [newTabList, code, isClient, cachedItem, width, items])
  


  // Insert new tabs into the tab list.
  const insertMainTabs = async () => {
    const found = tablists.find((tab) => {
      const [, , entityName] = tab.href.split('/');
      return entityName === entity;
    });

    if (found) {
      return;
    }
    const newTab = [
      ...tablists,
      {
        name: entity,
        href: pathname,
        current: true,
      },
    ]?.map((item) => {
      return {
        ...item,
        current: item.href === pathname,
      };
    }) as IPropsTabList[];
    setTablists(newTab);
    try {
      await updateAllMaindata(newTab)
      router.refresh();
    } catch (error) {
        console.error(error)
    }
  };

  // Close Class Tab
  // Not the current tab
  const closeTab = async (tab: IPropsTabList) => {
    // const newTab = sortTabsActiveWillSecond.filter(item => item.href !== tab?.href);
    // setNewTabList(newTab);
    // try {
    //   await updateAllMaindata(newTab)
    // } catch (error) {
    //     console.error(error)
    // }

    // // make it current tab
    // const activeTab = newTab[newTab.length - 1];
    // if (activeTab) {
    //   activeTab.current = true;
    //   router.push(activeTab?.href);
    // }
  };
  // Close Current Tab
  // Current tab
  const closeCurrentTab = (tab: IPropsTabList) => {
    // 1. Find the current tab
    // 2. remove the current tab
    // 3. active tab will be the left tab if the current tab is the last tab
    // 4. active tab will be the right tab if the current tab is the first tab
    // const currentTabIndex = newTabList.findIndex(
    //   item => item.href === tab.href,
    // );
    // if (currentTabIndex === -1) {
    //   return;
    // }
    // const newTab = [...newTabList];
    // newTab.splice(currentTabIndex, 1);
    // let activeTabIndex = currentTabIndex - 1;
    // if (activeTabIndex < 0) {
    //   activeTabIndex = 0;
    // }
    // const activeTab = newTab[activeTabIndex];
    // if (activeTab) {
    //   activeTab.current = true;
    //   router.push(activeTab?.href);
    // }

    // setNewTabList(newTab);
  };

  // Close All tabs
  // Except dashboard

  const closeAllTabs = () => {
    // const newTab = newTabList.filter(item => item.name === 'dashboard');
    // setNewTabList(newTab);
    // const found = newTab.find(item => item.name === 'dashboard');
    // if (!found) {
    //   router.push('/portal/dashboard');
    //   return;
    // }
    // router.push(found?.href);
  };

  // Close Other tabs
  const closeOtherTabs = (tab: IPropsTabList) => {
    // const newTab = newTabList.filter(
    //   item => item.name === tab?.name || item.name === 'dashboard',
    // );
    // if (newTab.length > 0 && newTab[0]) {
    //   newTab?.map((item) => {
    //     return {
    //       ...item,
    //       current: item.name === tab.name,
    //     };
    //   });
    //   const found = newTab.find(item => item.name == tab.name);
    //   if (!found) {
    //     newTab[0].current = true;
    //     router.push(newTab[0]?.href);
    //     return;
    //   }
    //   router.push(found?.href)
    // }
    // setNewTabList(newTab);
  };

  const actions = {
    closeTab,
    closeCurrentTab,
    closeAllTabs,
    closeOtherTabs,
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
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none  fixed md:static w-full top-[59px] flex justify-between gap-x-2 md:min-h-[2.0rem]  pl-0 lg:pl-0',
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
                        dropItems={copyTab?.filter((dta) => dta.hidden)}
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
