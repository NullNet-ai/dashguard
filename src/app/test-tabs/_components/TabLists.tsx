'use client';

import { ChevronDownIcon, GripVerticalIcon, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  updateAllMaindata,
  updateAllMaindata2,
} from '~/components/platform/Tab/Actions/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import {
  Sortable,
  SortableDragHandleRawItem,
  SortableItem,
} from '~/components/ui/sortable';
import { cn } from '~/lib/utils';

const Tablists = ({
  tabs = [],
  onTabChange,
}: {
  tabs: any[];
  onTabChange?: (tab: any) => void;
}) => {
  const [tablists, setTablists] = useState<any>(tabs);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(
    tabs?.length > 0 ? tabs.find((tab) => tab.current)?.id : 0,
  );

  const [copyTab, setCopyTab] = useState<any>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);

  useEffect(() => {
    setTablists(tabs);
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);

  useEffect(() => {
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData = items || tabs;

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

      return allItems;
    };

    const handleResize = () => {
      const items = calc(tablists);
      setCopyTab(items);
      updatecachedItems(items);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tablists]);

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
    onTabChange?.(selectedTab);
  };

  const handleTabClickDropdown = (selectedTab: any) => {
    setActiveTab(selectedTab.id);
    const newTablist = tablists.map((tab: any) => {
      return {
        ...tab,
        current: tab.id === selectedTab.id,
        is_current: tab.id === selectedTab.id,
      };
    });

    setTablists(newTablist);
    onTabChange?.(selectedTab);
  };

  const handleRemoveTab = (tab: any) => {
    const newTablist = tablists.filter((item: any) => item.id !== tab.id);
    setTablists(newTablist);
    onTabChange?.(newTablist[0]);
  };

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllMaindata2(items);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full gap-x-8">
      <div className="flex w-[800px] overflow-hidden border-b" ref={parentRef}>
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
          {tablists?.map((tab, index) => {
            const isHidden = copyTab?.[index]?.hidden;

            return (
              <SortableItem
                key={tab.id}
                value={tab.id}
                className={cn(`relative`, { '!opacity-0': isHidden })}
              >
                <div
                  ref={(el) => {
                    itemsRef.current[index] = el;
                  }}
                  data-width={copyTab?.[index]?.metadata?.item_width}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    'relative flex cursor-pointer items-center px-4 py-2 text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                  )}
                >
                  <SortableDragHandleRawItem className="mr-1 cursor-grab">
                    <GripVerticalIcon
                      className="h-3.5 w-3.5 text-default-foreground/60"
                      aria-hidden="true"
                    />
                  </SortableDragHandleRawItem>
                  {tab.name}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTab(tab);
                    }}
                  >
                    X
                  </button>
                </div>
              </SortableItem>
            );
          })}
        </Sortable>
        {/* has hidden items */}
      </div>
      {copyTab?.some((tab) => tab.hidden) ? (
        <div className="flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-400">
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
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                  }}
                  className="text-default/60 transition-opacity duration-200 hover:opacity-30"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="my-2 max-h-[calc(100vh-209px)] overflow-y-auto">
                {copyTab
                  ?.filter(
                    (dta) =>
                      dta.hidden 
                  )
                  .map((itm) => {
                    if (!itm.hidden) {
                      return null;
                    }
                    return (
                      <DropdownMenuItem
                        key={itm.name}
                        className="group relative flex items-center justify-between py-1"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabClickDropdown(itm);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {itm?.name}
                        </button>
                      </DropdownMenuItem>
                    );
                  })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        'no'
      )}
      <div>Other components</div>
    </div>
  );
};

export default Tablists;
