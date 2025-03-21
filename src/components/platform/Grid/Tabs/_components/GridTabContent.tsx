
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
import { debounce, lowerCase, toLower } from 'lodash';
import GridtabDropItem from './GridtabDropItem';
import { reorderShowActiveItem } from '~/utils/sort-tab-items';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import GridMenuClient from '../GridMenuClient';
import GridMenuDropClient from './GridMenuDropClient';

const GridTabContent = ({  
    par_items = [],
    pathname,
    isWindowLoaded,
    application,
    code,
    variant}: any) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<any[]>([]);
    const [datas, setDatas] = useState(par_items)
    const itemsRef = useRef<any[]>([]);
    const [entity] = pathname.split('/').slice(2);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState<string>('')
    const  {state: drawerState,  } = useSideDrawer ()
    const {width, isOpen, isPinned} = drawerState
    const updateCache = (items?: any[]) => {

        const newItems = items || par_items;
        if (newItems?.length) {
          const getCurrent = getActiveName() || ''
          const neworderData = reorderShowActiveItem(newItems, code, application)
          const cachedData = {
            tabs: neworderData,
            lastShownItem: lastShownItem?.name,
            prevCurrent: getCurrent,
            key:  'grid_tab_' + entity,
          }
          const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
      
          localStorage.setItem('cachedPortalItems', JSON.stringify({
            ...cachedItems,
            [`grid_tab_${entity}`]: cachedData,
          }))
        }
      }
    
      const getActiveName = useMemo(() => {
            return par_items?.find((item: any) => item.current)?.name;
      }, [par_items]);
  

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
            totalWidth += 6;
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
      },  [par_items, parentRef?.current?.offsetWidth, drawerState])
    

    const lastShownItem = useMemo(() => {
        if (data?.length > 0) {
          const removeHidden = data.filter((item: any) => !item.hidden);
          const lastItem = removeHidden[removeHidden.length - 1];
          return lastItem;
        }
      }, [data]);

    const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearchValue(searchValue);
    }, 300);  // 300ms delay

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
            `flex items-center grid-tab-content flex-1 w-full gap-x-1 relative`, `overflow-hidden`,
          )}
        >
          <Sortable
            orientation="horizontal"
            value={datas}
            onMove={({ activeIndex, overIndex }) => {
              setDatas((items: any) => {
                const newItems = [...items];
                const [removed] = newItems.splice(activeIndex, 1);
                newItems.splice(overIndex, 0, removed);
                return newItems;
              });
  
              setTimeout(() => {
                updateCache()
              }, 1000);
              
            }}
          >
            {datas.map((tab: any, index: number) => {

              const isHidden = data?.[index]?.hidden;

              if(lowerCase(tab.name)  === 'all contact') {
                return (
                  <GridTabItem
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
                  <GridTabItem
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
          {(!!data?.length && !data.some((item) => item.hidden) && isWindowLoaded ) && <CreateNewFilter />}
          
        </div>
       
        {!!data?.length && data.some((item) => item.hidden) && isWindowLoaded && (
          <>
          {(!!data?.length && data.some((item) => item.hidden) && isWindowLoaded ) && <CreateNewFilter />}
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
                    // const isGrid = itm.name === 'Grid' || itm.name === 'grid';
                    // const isGridActive =
                    //   application === 'Grid' || application === 'grid';
                    // const isActive = isGridActive ? !!isGrid : code === itm?.name;
    
                    if (!itm.hidden) {
                      return null;
                    }
    
                    return (
                      <DropdownMenuItem
                        key={itm.name}
                        className="group relative flex items-center py-1 justify-between"
                      >
                        <GridtabDropItem
                          tab={itm}
                          shownItems={data}
                          dropItems={data?.filter((dta) => dta.hidden)}
                          pathname={pathname}
                          onSelect={() => setIsDropdownOpen(false)}
                          isActive={false}
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
    )
}


export default GridTabContent