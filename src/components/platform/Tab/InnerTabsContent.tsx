'use client';

import Cookies from 'js-cookie';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';


import {
  Sortable,
  SortableDragHandle,
  SortableDragHandleRawItem,
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
import { debounce, toLower } from 'lodash';  // Add this import at the top
import { boolean } from 'zod';

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

  const [entity] = pathname.split('/').slice(2);

  const conWidth = useMemo(() => ({
    width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);

  useEffect(() => {
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
      return allItems;
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
    const handleResize = () => {
      // Clear any existing timeout to prevent multiple executions
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        if (data?.length) {
          Cookies.set(`${entity}-innerCopiedLastItems`, JSON.stringify(data));
        }
      }, 1000);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          value={par_items}
          onMove={({ activeIndex, overIndex }) => {
            // setItems((items) => {
            //   const newItems = [...items];
            //   const [removed] = newItems.splice(activeIndex, 1);
            //   newItems.splice(overIndex, 0, removed);
            //   return newItems;
            // });
          }}
        >
          {par_items.map((tab: any, index: number) => {
            const isHidden = data?.[index]?.hidden;
            return (
              <SortableItem key={tab.name} value={tab.name} className="relative">
                <SortableDragHandleRawItem className="">
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
                </SortableDragHandleRawItem>
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
