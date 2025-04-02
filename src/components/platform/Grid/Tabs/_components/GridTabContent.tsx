
'use client'
import { cn } from '~/lib/utils';
import { Button } from '@headlessui/react';
import CreateNewFilter from '../CreateNewFilter';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sortable, SortableItem } from '~/components/ui/sortable';
import GridTabItem from './GridtabItem';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { debounce, lowerCase, toLower } from 'lodash';
import GridtabDropItem from './GridtabDropItem';
import { calculateVisibleItems, reorderGridTabActive, reorderShowActiveItem } from '~/utils/sort-tab-items';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import GridMenuClient from '../GridMenuClient';
import GridMenuDropClient from './GridMenuDropClient';
import { updateAllFilterdata } from '../SideDrawer/actions';

const GridTabContent = ({  
    par_items = [],
    pathname,
    isWindowLoaded,
    application,
    code,
    variant}: any) => {

    const parentRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<any[]>(par_items);
    const [datas, setDatas] = useState(par_items)
    const itemsRef = useRef<any[]>([]);
    const [entity] = pathname.split('/').slice(2);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState<string>('')
    const  {state: drawerState,  } = useSideDrawer ()

      const updatecachedItems =  async (items: any) => {
        // const getCurrent = getActiveName() || ''
        // const neworderData = reorderGridTabActive(copiedItem, activeItem?.id ?? '', application ?? '')
         const removeHidden = items.filter((item: any) => !item.hidden);
          const lastItem = removeHidden[removeHidden.length - 1];
   
        const cachedData = {
          tabs: items,
          lastShownItem: lastItem?.name,
          prevCurrent: 'test',
          key:  'grid_tab_' + entity,
        }

        try {
          await updateAllFilterdata(items)
        } catch (error) {
            console.error(error)
        }


        const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
    
        localStorage.setItem('cachedPortalItems', JSON.stringify({
          ...cachedItems,
          [`grid_tab_${entity}`]: cachedData,
        }))
      }

    useEffect(() => {

         const calc = (items?: any[]) => {

              const allItems: any[] = [];
              const newData = par_items ;
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
                        order: index,
                        metadata:{
                          item_width: (itemsRef.current[index].offsetWidth + 6) || 0,
                        }
                        });
                    } else {
                        allItems?.push({
                        ...newData[index],
                        hidden: false,
                        order: index,
                        metadata:{
                          item_width: (itemsRef.current[index].offsetWidth + 6) || 0,
                        }
                        });
                    }
                  }
              }

              
              const result  = calculateVisibleItems(allItems, containerWidth, entity)
              return result

          };
    
        const handleResize =  async () => {

          const items = calc();

          if (JSON.stringify(items) !== JSON.stringify(par_items)) {
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
            `flex items-center grid-tab-content flex-1 w-full gap-x-1 relative lg:max-w-[70vw] max-w-[71vw]`, `overflow-hidden`,
          )}
        >
          <Sortable
            orientation="horizontal"
            value={data}
            onMove={({ activeIndex, overIndex }) => {
              setData((items: any) => {
                const newItems = [...items];
                const [removed] = newItems.splice(activeIndex, 1);
                newItems.splice(overIndex, 0, removed);

                //update the cached in localstorage
                updatecachedItems(newItems)

                return newItems;
              });

              
            }}
          >
            {par_items.map((tab: any, index: number) => {

              const isHidden = data?.[index]?.hidden;
              const lastword = entity.split("_")?.[1] ? entity.split("_")?.[1] : entity;

              if(lowerCase(tab.name).includes('all') && lowerCase(tab.name).includes(lastword)) {
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
          {(!!data?.length && data.some((item) => item.hidden) && isWindowLoaded ) && (
            <div>
              <CreateNewFilter />
            </div>
          )}
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