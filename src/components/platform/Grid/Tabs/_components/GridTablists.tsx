'use client';
import { cn } from '~/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@headlessui/react';
import CreateNewFilter from '../CreateNewFilter';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Sortable, SortableItem } from '~/components/ui/sortable';
import GridTabItem from './GridtabItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { debounce, lowerCase, toLower } from 'lodash';
import GridtabDropItem from './GridtabDropItem';
import useWindowSize from '~/hooks/use-resize';
import {
  calculateMainTabItems,
} from '~/utils/sort-tab-items';
import { useSidebar } from '~/components/ui/sidebar';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import { updateAllMaindata } from '~/components/platform/Tab/Actions/actions';

const GridTabLists = ({ tabs }: { tabs: any[] }) => {
  const newPathname = usePathname();
  const { open } = useSidebar();
  const router = useRouter();
  const [portal, entity, application, code] = (newPathname || '')
    .split('/')
    .slice(1);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { width: winWidth } = useWindowSize();
  const [tablists, setTablists] = useState<any[]>(tabs);
  const [copyTab, setCopyTab] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const { state: drawerState } = useSideDrawer();
  const [activeTab, setActiveTab] = useState<string>(
    tabs?.length > 0 ? tabs.find((tab) => tab.current)?.id : 'dashboard',
  );

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

  // window load
  useEffect(() => {
    const handleLoad = () => setIsWindowLoaded(true);

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setIsWindowLoaded(true);
      } else {
        window.addEventListener('load', handleLoad);
      }
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);


  useEffect(() => {
    const calc = (params?: any[]) => {
      const allItems: any[] = [];
      const newData = params || tabs;

      // clear width, more width, and search by
      let totalWidth = 32
      const containerWidth = parentRef.current?.offsetWidth || 0;

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0 + 4;
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
      } else {
        updatecachedItems(items);
        if(activeTab) {
          const href= items?.find((item) => item.current)?.href;
          router.push(href);
        }
      }

    };
    if(isClient){
      handleResize();
    }
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
      await updateAllMaindata(items)
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


  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      aria-label="Tabs"
      className={cn('grid-tab-list flex w-full flex-1 justify-between')}
    >
      <div
        ref={parentRef}
        className={cn(
          `grid-tab-content relative flex w-full max-w-[71vw] flex-1 items-center gap-x-1 lg:max-w-[70vw]`,
          `overflow-hidden`,
        )}
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
            const lastword: any = entity?.split('_')?.[1]
              ? entity.split('_')?.[1]
              : entity || ''

            if (
              lowerCase(tab.name).includes('all') &&
              lowerCase(tab.name).includes(lastword)
            ) {
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
                  onClickItem={handleTabClick}
                  index={index}
                  tab={tab}
                  newItems={tablists}
                  key={index}
                />
              );
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
                  index={index}
                  onClickItem={handleTabClick}
                  tab={tab}
                  newItems={tablists}
                  key={index}
                />
              </SortableItem>
            );
          })}
        </Sortable>
        {!!copyTab?.length &&
          !copyTab.some((item) => item.hidden) &&
          isWindowLoaded && <CreateNewFilter />}
      </div>
      {copyTab?.some((tab: any) => tab.hidden) && isWindowLoaded && (
        <>
          {!!copyTab?.length &&
            copyTab.some((item) => item.hidden) &&
            isWindowLoaded && (
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
            <DropdownMenuContent align="end" alignOffset={5}>
              <div className="flex min-w-[265px] flex-row justify-between p-2 pb-3">
                <h3 className="text-base text-default/90">Open Tabs</h3>
                <Button
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                  className="text-default/60 transition-opacity duration-200 hover:opacity-30"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="p-2">
                <Input
                  Icon={Search}
                  iconPlacement="left"
                  iconClassName="size-4"
                  placeholder="Search..."
                  onChange={handleSearch}
                />
              </div>
              <div className="my-2 max-h-[calc(100vh-209px)] overflow-y-auto">
                {copyTab
                  ?.filter(
                    (dta) =>
                      dta.hidden &&
                      (!!searchValue
                        ? toLower(dta?.name)?.includes(toLower(searchValue))
                        : true),
                  )
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
                        className="group relative flex items-center justify-between py-1"
                      >
                        <GridtabDropItem
                          tab={itm}
                          shownItems={tablists}
                          dropItems={copyTab?.filter((dta) => dta.hidden)}
                          pathname={newPathname}
                          onSelect={() => setIsDropdownOpen(false)}
                          isActive={false}
                          onClickItem={handleTabClickDropdown}
                        />
                      </DropdownMenuItem>
                    );
                  })}
                {!hasResult && searchValue ? (
                  <div className="text-center text-sm text-default/65">
                    No result...
                  </div>
                ) : null}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default GridTabLists;
