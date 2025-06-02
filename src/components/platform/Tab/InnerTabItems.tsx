'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';
import {
  calculateMainTabItems,
  reorderItems,
  reorderShowActiveItem,
} from '~/utils/sort-tab-items';

import InnerTabsContent from './InnerTabsContent';
import { api } from '~/trpc/react';
import useWindowSize from '~/hooks/use-resize';
import { useSideDrawer } from '../SideDrawer';
import { Sortable, SortableItem } from '~/components/ui/sortable';
import { updateAllInnerdata, updateAllMaindata } from './Actions/actions';
import { debounce, lowerCase, toLower } from 'lodash';
import InnerTabitem from './InnerTabitem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ChevronDownIcon, Search, X } from 'lucide-react';
import { Button } from '@headlessui/react';
import { Input } from '~/components/ui/input';
import InnerDropTabItem from './InnerDropTabItem';

type InnerTabItemsProps = {
  tabs: any[];
  pathname?: string;
  variant?: 'drawer' | 'dropdown';
};

export interface ITabs {
  name: string;
  href: string;
  current: boolean;
  label: string;
  id: string;
  is_current: boolean;
  hidden: boolean;
  order: number;
  metadata: {
    item_width: number;
  };
}

export interface IArgs {
  pathname: string;
  current: boolean;
  tabs: ITabs[];
}

const InnerTabItems = ({ tabs, pathname, variant }: InnerTabItemsProps) => {
  const { isBannerPresent } = useSidebar();
  const router = useRouter();
  const newPathname = usePathname();
  const fullSearchQueryParams = useSearchParams();
  const { open } = useSidebar();
  const [portal, entity, application, code] = (newPathname || '')
    .split('/')
    .slice(1);
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  const [tablists, setTablists] = useState<any[]>(tabs);
  const [copyTab, setCopyTab] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const { state: drawerState } = useSideDrawer();
  const { width, isOpen, isPinned } = drawerState;
  const [activeTab, setActiveTab] = useState<string>(
    tabs?.length > 0 ? tabs.find((tab) => tab.current)?.id : 'dashboard',
  );

  const conWidth = useMemo(
    () => ({
      width: `calc(100vw - ${open ? '320px' : '140px'} ${width && isOpen && isPinned ? `- ${width} ` : ''})`,
    }),
    [open, width],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!application) return;
    // Build full URL with search params
    const fullUrl = `${newPathname}${fullSearchQueryParams.toString() ? `?${fullSearchQueryParams.toString()}` : ''}`;
    // Save the full URL to localStorage
    localStorage.setItem('last_visited_url:' + entity, fullUrl);
  }, [newPathname, fullSearchQueryParams, tablists]);

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
      const result = calculateMainTabItems(allItems, containerWidth, '');
      return result;
    };

    const handleResize = () => {
      const items = calc(tablists);
      setCopyTab(items);
      if (JSON.stringify(tablists) !== JSON.stringify(items)) {
        if (items?.length) {
          updatecachedItems(items);
        }
      } else {
        updatecachedItems(items);
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
  }, 300); // 300ms delay

  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchValue('');
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    let queryParams = '';
    if (fullSearchQueryParams?.toString()) {
      queryParams = `?${fullSearchQueryParams?.toString()}`;
    }

    const pathExist = tablists?.find(
      (tab) => tab.href === newPathname + queryParams,
    );
    if (!pathExist && application !== 'grid') {
      const newTablist = [...tablists];
      const newTab = {
        name: code || 'New Tab',
        href: newPathname + queryParams,
        current: true,
        is_current: true,
        label: code || 'New Tab',
        id: code || 'New Tab',
      };
      // then all current under newTablist will not be the current
      const newTablistWithoutCurrent = newTablist.map((tab: any) => {
        return {
          ...tab,
          current: false,
          is_current: false,
          id: tab?.code || 'New Tab',
        };
      });
      const newTablistWithCurrent = [...newTablistWithoutCurrent, newTab];
      const findCurrent = newTablistWithCurrent?.find(
        (tab: any) => tab.current,
      );
      // Remove duplicate by name
      // Using reduce
      const uniqueItems = newTablistWithCurrent.reduce(
        (acc: any, current: any) => {
          return {
            ...acc,
            [current.name]: current,
          };
        },
        {},
      );

      setTablists(Object.values(uniqueItems ?? {}));
      setActiveTab(findCurrent?.id);
      updatecachedItems(Object.values(uniqueItems ?? {}));
    } else {
      const newTablist = tablists.map((tab: any) => {
        return {
          ...tab,
          current: tab.href === newPathname,
        };
      });

      const uniqueItems = newTablist.reduce((acc: any, current: any) => {
        return {
          ...acc,
          [current.name]: current,
        };
      }, {});

      setTablists(Object.values(uniqueItems ?? {}));
      const findCurrent = newTablist?.find((tab: any) => tab.current);
      setActiveTab(findCurrent?.id);
      updatecachedItems(Object.values(uniqueItems ?? {}));
    }
  }, [newPathname]);

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllInnerdata(items, `/${portal}/${entity}`);
    } catch (error) {
      console.error(error);
    }
  };

  const hasResult = useMemo(() => {
    if (tablists?.length && searchValue !== '') {
      return Boolean(
        tablists?.filter(
          (dta) =>
            dta.hidden &&
            (!!searchValue
              ? toLower(dta?.name)?.includes(toLower(searchValue))
              : true),
        )?.length,
      );
    }
    return false;
  }, [tablists, searchValue]);

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

  const handleCloseTab = ({ pathname, current, tabs }: IArgs) => {
    // IF current close the current tab then move to the left index tab
    // Push the current tab to the left index tab
    // IF not current close the current tab then move to the right index tab
    // Push the current tab to the right index tab
    const newTablist = tabs.map((tab: any) => {
      return {
        ...tab,
        current: tab.href === pathname,
        is_current: tab.href === pathname,
      };
    });
    const findCurrentIndex = newTablist?.findIndex(
      (tab: any) => tab.is_current,
    );
    const newTablistWithoutCurrent = newTablist.map((tab: any) => {
      return {
        ...tab,
        current: false,
        is_current: false,
      };
    });

    if (findCurrentIndex === 0) {
      newTablistWithoutCurrent[findCurrentIndex + 1].current = true;
      newTablistWithoutCurrent[findCurrentIndex + 1].is_current = true;
      // Remove current tab from tabList
      const newTablistWithoutCurrentWithoutCurrent =
        newTablistWithoutCurrent.filter((tab: any) => !tab.is_current);
      setTablists(newTablistWithoutCurrentWithoutCurrent);
    } else {
      newTablistWithoutCurrent[findCurrentIndex - 1].current = true;
      newTablistWithoutCurrent[findCurrentIndex - 1].is_current = true;
      // Remove current tab from tabList
      // Filter tab base on href
      // A B C
      // A
      const newTablistWithoutCurrentWithoutCurrent =
        newTablistWithoutCurrent.filter((tab: any) => tab?.href !== pathname);
      setTablists(newTablistWithoutCurrentWithoutCurrent);

      if (current) {
        router.push(
          newTablistWithoutCurrentWithoutCurrent[findCurrentIndex - 1].href,
        );
        return;
      }
    }
  };

  const handleCloseOtherTabs = ({ pathname, current, tabs }: IArgs) => {
    if (current) {
      const filteredTabs = tablists?.filter((tab: any) => {
        return tab?.href === pathname || tab?.name?.toLowerCase() === 'grid';
      });
      setTablists(filteredTabs);
      return;
    } else {
      const filteredTabs = tablists?.filter((tab: any) => {
        return tab?.href === pathname || tab?.name?.toLowerCase() === 'grid';
      });
      const foundSelected = filteredTabs?.find((tab: any) => {
        return tab?.href === pathname;
      });
      setTablists(filteredTabs);
      router.push(foundSelected?.href);
      return;
    }
  };

  const handleCloseAllTabs = () => {
    const filteredTabs = tablists?.filter((tab: any) => {
      return tab?.name?.toLowerCase() === 'grid';
    });
    setTablists(filteredTabs);
    router?.push(filteredTabs?.[0]?.href);
  };

  const tabsAction = {
    handleCloseTab,
    handleCloseOtherTabs,
    handleCloseAllTabs,
  };

  return (
    <nav
      aria-label="Tabs"
      className={cn(
        'scrollbar-hide fixed top-[89px] z-[49] flex w-full justify-between gap-x-2 border-b bg-white pl-0 md:static md:min-h-[2.3rem] md:bg-none lg:pl-0',
        isBannerPresent ? 'mt-12 md:mt-7' : 'md:mt-[-4px]',
      )}
    >
      <div
        ref={parentRef}
        className={cn(`flex items-center`, `overflow-hidden`)}
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

            if (lowerCase(tab.name) === 'grid') {
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
                  pathname={newPathname}
                  key={tab.name + index}
                  tabsAction={tabsAction}
                />
              );
            }
            return (
              <SortableItem
                key={tab.id + index}
                value={tab.id}
                className="relative"
              >
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
                  pathname={newPathname}
                  key={index}
                  tabsAction={tabsAction}
                />
              </SortableItem>
            );
          })}
        </Sortable>
      </div>
      {copyTab?.some((tab: any) => tab.hidden) && isWindowLoaded && (
        <>
          {variant === 'dropdown' ? (
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
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
                      const isGrid = itm.name === 'Grid' || itm.name === 'grid';
                      const isGridActive =
                        application === 'Grid' || application === 'grid';
                      const isActive = isGridActive
                        ? !!isGrid
                        : code === itm?.name;

                      if (!itm.hidden) {
                        return null;
                      }

                      return (
                        <DropdownMenuItem
                          key={itm.name}
                          className="group relative flex items-center justify-between py-1"
                        >
                          <InnerDropTabItem
                            tab={itm}
                            onClickItem={handleTabClickDropdown}
                            shownItems={tablists}
                            dropItems={copyTab?.filter(
                              (dta: any) => dta.hidden,
                            )}
                            pathname={pathname}
                            onSelect={() => setIsDropdownOpen(false)}
                            isActive={isActive}
                          />
                        </DropdownMenuItem>
                      );
                    })}
                  {!hasResult ? (
                    <div className="text-center text-sm text-default/65">
                      No result...
                    </div>
                  ) : null}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            ''
          )}
        </>
      )}
    </nav>
  );
};

export default InnerTabItems;
