'use client';

import { ChevronDownIcon, Search, X } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';


import {
  Sortable,
  SortableItem,
} from '~/components/ui/sortable';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';

import InnerDropTabItem from './InnerDropTabItem';
import InnerTabitem from './InnerTabitem';
import { SideDrawerView, useSideDrawer } from '../SideDrawer';
import { Input } from '~/components/ui/input';
import { Button } from '@headlessui/react';
import { debounce, lowerCase, toLower } from 'lodash';  // Add this import at the top
import { reorderShowActiveItem } from '~/utils/sort-tab-items';
import { updateAllInnerdata } from './Actions/actions';
const InnerTabsContent = ({
  par_items = [],
  pathname,
  isWindowLoaded,
  application,
  code,
  variant
}: any) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const { open } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const  {state: drawerState,  } = useSideDrawer ()
  const {width, isOpen, isPinned} = drawerState
  const [searchValue, setSearchValue] = useState<string>('')
  const [, portal, entity] = pathname?.split('/') || [];
  const [datas, setDatas] = useState(par_items)

  const conWidth = useMemo(() =>   ({
    width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);


  const updateCache = (items?: any[]) => {

    const newItems = items || par_items;
    if (newItems?.length) {
      const getCurrent = getActiveName() || ''
      const neworderData = reorderShowActiveItem(newItems, code, application)
      const cachedData = {
        tabs: neworderData,
        lastShownItem: lastShownItem?.name,
        prevCurrent: getCurrent,
        key:  'inner_tab_data_' + entity,
      }
      const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
  
      localStorage.setItem('cachedPortalItems', JSON.stringify({
        ...cachedItems,
        [`inner_tab_data_${entity}`]: cachedData,
      }))
    }
  }

  const updatecachedItems =  async (items: any) => {
    // const getCurrent = getActiveName() || ''
    // const neworderData = reorderGridTabActive(copiedItem, activeItem?.id ?? '', application ?? '')
     const removeHidden = items.filter((item: any) => !item.hidden);
      const lastItem = removeHidden[removeHidden.length - 1];

    const cachedData = {
      tabs: items,
      lastShownItem: lastItem?.name,
      key:  'inner_tab_data_' + entity,
    }

    try {
      await updateAllInnerdata(items, `/${portal}/${entity}`)
    } catch (error) {
        console.error(error)
    }

    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`inner_tab_data_${entity}`]: cachedData,
    }))
  }


  const getActiveName = useMemo(() => {
      return () => {
        if (application === 'grid') {
          return 'grid'
        }
        return code
      }
    }, [application, code]);

  useEffect(() => {

    if(JSON.stringify(par_items) !== JSON.stringify(datas)) {
      setDatas(par_items)
    }
    
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData = items || par_items;
      // clear width, more width, and search by
      let totalWidth = 0;
      const containerWidth = parentRef.current?.offsetWidth || 0;

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0;
          totalWidth += 8;
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
            });
          } else {
            allItems?.push({
              ...newData[index],
              hidden: false,
            });
          }
        }
      }

      return allItems

    };


    const handleResize = () => {
      const items = calc();
      if (JSON.stringify(items) !== JSON.stringify(data)) {
        setData(items);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [par_items, parentRef?.current?.offsetWidth, drawerState])


  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
  }, 300);  // 300ms delay
  

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResized = () => {
      
      // Clear any existing timeout to prevent multiple executions
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        updateCache()
      }, 1000);
    };

    window.addEventListener('resize', handleResized);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResized);
    };
  }, []);

  useEffect(() => {
    if(!isDropdownOpen) {
      setSearchValue('')
    }
  }, [isDropdownOpen])
  

  const lastShownItem = useMemo(() => {
    if (data?.length > 0) {
      const removeHidden = data.filter((item: any) => !item.hidden);
      const lastItem = removeHidden[removeHidden.length - 1];
      return lastItem;
    }
  }, [data]);

  const hasResult = useMemo(() => {
    if(data?.length) {
     return  Boolean(data?.filter((dta) => dta.hidden && (!!searchValue ? toLower(dta?.name)?.includes(toLower(searchValue)) : true ))?.length)
    } 
    return false
  }, [data, searchValue])

  return (
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
          value={datas}
          onMove={({ activeIndex, overIndex }) => {
            setDatas((items: any) => {
              const newItems = [...items];
              const [removed] = newItems.splice(activeIndex, 1);
              newItems.splice(overIndex, 0, removed);
              updatecachedItems(newItems)
              return newItems;
            });


            // setTimeout(() => {
            //   updateCache()
            // }, 1000);
            
          }}
        >
          {datas.map((tab: any, index: number) => {
            const isHidden = data?.[index]?.hidden;

            if(lowerCase(tab.name) === 'grid') {
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
                  lastShownItem={lastShownItem}
                  index={index}
                  tab={tab}
                  newItems={data}
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
                    ref={(el) => {
                      if (el) {
                        if (itemsRef.current) {
                          itemsRef.current[index] = el;
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
              </SortableItem>
            );
          })}
        </Sortable>
      </div>
      {!!data?.length && data.some((item) => item.hidden) && isWindowLoaded && (
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
              {data
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
                        shownItems={data}
                        dropItems={data?.filter((dta) => dta.hidden)}
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
    </>
  );
};

export default InnerTabsContent;
