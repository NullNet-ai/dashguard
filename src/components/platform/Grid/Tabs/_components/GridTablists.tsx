
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

const GridTabLists = ({items}: any) => {
    const pathname = usePathname()
    const parentRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<any[]>([]);
    const [datas, setDatas] = useState(items)
    const itemsRef = useRef<any[]>([]);
    const [entity] = pathname.split('/').slice(2);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState<string>('')
    const [isWindowLoaded, setIsWindowLoaded] = useState(false)


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

    const updateCache = (param_items?: any[]) => {

        // const newItems = param_items || items;
        // if (newItems?.length) {
        //   const getCurrent = tab.current
        //   const neworderData = reorderShowActiveItem(newItems, code, application)
        //   const cachedData = {
        //     tabs: neworderData,
        //     lastShownItem: lastShownItem?.name,
        //     prevCurrent: getCurrent,
        //     key:  'inner_tab_data_' + entity,
        //   }
        //   const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
      
        //   localStorage.setItem('cachedPortalItems', JSON.stringify({
        //     ...cachedItems,
        //     [`grid_tab_data_${entity}`]: cachedData,
        //   }))
        // }
      }
    // const conWidth = useMemo(() =>   ({
    //     width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
    //   }), [open, width]);
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
            `flex items-center`, `overflow-hidden`,
          )}
        //   style={conWidth}
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
        </div>
        {!!data?.length && data.some((item) => item.hidden) && isWindowLoaded && (
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
                        {/* <InnerDropTabItem
                          tab={itm}
                          shownItems={data}
                          dropItems={data?.filter((dta) => dta.hidden)}
                          pathname={pathname}
                          onSelect={() => setIsDropdownOpen(false)}
                          isActive={isActive}
                        /> */}
                      </DropdownMenuItem>
                    );
                  })}
                  {!hasResult ? <div className='text-sm text-center text-default/65'>No result...</div> : null}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <CreateNewFilter />
      </>
    )

    // return (
    //     <div className="flex flex-row gap-2">
    //         {items?.map((tab: any, index: number) => {
    //         const active = tab.current ? 'text-primary' : 'text-foreground';
    //         const entity = tab?.href?.split('/').at(2);
    //         const applicationType = tab?.href?.split('/').at(3)?.split('?')[0];
    //         return (
    //             <Link
    //             href={tab?.href ?? ''}
    //             key={tab.id}
    //             data-test-id={
    //                 entity +
    //                 '-' +
    //                 applicationType +
    //                 '-tab-' +
    //                 tab.name.split(' ').join('-').toLowerCase() || 'tab'
    //             }
    //             className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm"
    //             >
    //             <span className={cn(active, '')}>{toCapitalize(tab.name)}</span>
    //             <GridMenu tab={tab} filter_id={tab?.id} />
    //             </Link>
    //         );
    //         })}
    //         <CreateNewFilter />
    //     </div>
    // )
}


export default GridTabLists