'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ulid } from 'ulid';
import {
  updateAllGridData,
  updateAllInnerdata,
} from '~/components/platform/Tab/Actions/actions';
import { cn, formatGridTabName } from '~/lib/utils';
import InnerTabitem from './InnerTabitem';
import { useSidebar } from '~/components/ui/sidebar';
import TabMenu from '~/components/application-layout/common/TabMenu';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import { capitalize } from 'lodash';
import { testIDFormatter } from '~/utils/formatter';
import CreateButtonTabs from './components/CreateButtonInTabs';
import RecordDetails from '~/components/application-layout/Header/RecordDetails';
import { Separator } from '~/components/ui/separator';

interface Tab {
  id: string;
  name: string;
  current: boolean;
  href: string;
  default: boolean;
  [key: string]: any; // Allow additional properties for scalability
}

interface DraggableTabsProps {
  initialTabs?: ITabs[];
}

export interface ITabs {
  name: string;
  href: string;
  current: boolean;
  label?: string;
  id: string;
  is_current?: boolean;
  hidden?: boolean;
  order?: number;
  default?: boolean;
  metadata?: {
    item_width: number;
  };
  [key: string]: any;
}

export interface IArgs {
  tab: ITabs;
  current?: boolean;
}

const InnerEnhanceTabItems: React.FC<DraggableTabsProps & { hasNewButton?: boolean }> = ({
  initialTabs,
  hasNewButton = false,
}) => {
  const [tabs, setTabs] = useState<ITabs[]>(initialTabs ?? []);

  const newPathname = usePathname();
  const searchParams = useSearchParams();
  const { isBannerPresent, open } = useSidebar();
  const [visibleTabs, setVisibleTabs] = useState<ITabs[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<ITabs[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTab, setDraggedTab] = useState<ITabs | null>(null);
  const router = useRouter();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const screenType = useScreenType();
  const isMobile =
    screenType === 'xs' || screenType === 'sm' || screenType === 'md';

  const [portal, entity, application, code] = (newPathname || '')
    .split('/')
    .slice(1);

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllInnerdata(items, `/${portal}/${entity}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!application || !entity) return;
    // Build full URL with search params
    const fullUrl = `${newPathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    // Save the full URL to localStorage
    localStorage.setItem('last_visited_url:' + entity, fullUrl);
  }, [newPathname, searchParams.toString(), initialTabs]);

  useEffect(() => {
    const fullPathName = `${newPathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const existTab = tabs?.find((tab) => tab.name === code);
    // if (!existTab) {
    const newMapped = tabs?.map((tab) => {
      if (
        tab?.name === code ||
        (tab?.name === application && tab?.name !== 'new')
      ) {
        return {
          ...tab,
          href: fullPathName,
          current: true,
        };
      }

      const findTabs = initialTabs?.find((_tab) => _tab?.id === tab?.id);
      if (
        findTabs &&
        tab?.name === 'new' &&
        application !== 'grid' &&
        code === findTabs?.name
      ) {
        return {
          ...findTabs,
          href: fullPathName,
          current: true,
        };
      }

      if (tab?.name === code && !findTabs) {
        return {
          ...tab,
          href: fullPathName,
          current: true,
        };
      }
      return {
        ...tab,
        current: false,
      };
    });

    const updatedTabs = [...(newMapped ?? [])];
    const newExistTab = updatedTabs?.find((tab) => tab?.name === code);

    if (!existTab && application != 'grid' && !newExistTab) {
      updatedTabs.push({
        id: ulid(),
        name: code!,
        current: true,
        href: fullPathName,
        default: false,
        label: code,
      });
    }

    setTabs(updatedTabs);
    updatecachedItems(updatedTabs);
    // console.log("newPathname", {newPathname, searchParams: searchParams.size})
  }, [newPathname, searchParams.toString()]);

  // Handle tab click (visible tabs)
  const handleTabClick = (tabId: string) => {
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    // const newTabs = tabs.map((tab) => ({
    //   ...tab,
    //   current: tab.id === tabId,
    //   is_current: tab.id === tabId,
    // }));
    // setTabs(newTabs);
    // updatecachedItems(newTabs);
    if (selectedTab?.href) {
      router.push(selectedTab.href);
    }
  };

  // Handle dropdown item click (switch with last visible tab)
  const handleDropdownItemClick = (selectedTab: ITabs) => {
    if (visibleTabs.length === 0) return;

    const lastVisibleTab = visibleTabs[visibleTabs.length - 1];

    // Update the current property for all tabs
    const updatedAllTabs = tabs.map((tab) => ({
      ...tab,
      current: tab.id === selectedTab.id,
    }));

    const newVisibleTabs = [...visibleTabs.slice(0, -1), {
      ...selectedTab,
      current: true
    }];
    const newHiddenTabs = hiddenTabs.filter((tab) => tab.id !== selectedTab.id);
    if (lastVisibleTab) {
      // Add to first position instead of last position
      newHiddenTabs.unshift({
        ...lastVisibleTab,
        current: false
      });
    }
    // Update the main tabs state
    setTabs([
      ...newVisibleTabs,
      ...newHiddenTabs
    ]);
  
    updatecachedItems([
      ...newVisibleTabs,
      ...newHiddenTabs
    ]);
  

    setVisibleTabs(newVisibleTabs);
    setHiddenTabs(newHiddenTabs);
    setActiveTabId(selectedTab.id);
    setIsDropdownOpen(false);

    setTimeout(() => {
      if (selectedTab?.href) {
        router?.push(selectedTab?.href);
      }
    }, 10);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, tab: ITabs) => {
    // Prevent dragging default tabs
    if (tab.default) {
      e.preventDefault();
      return;
    }

    setDraggedTab(tab);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTab: ITabs) => {
    e.preventDefault();
    // Prevent dropping onto default tabs
    if (!draggedTab || draggedTab.id === targetTab.id || targetTab.default)
      return;

    const draggedIndex = visibleTabs.findIndex(
      (tab) => tab.id === draggedTab.id,
    );
    const targetIndex = visibleTabs.findIndex((tab) => tab.id === targetTab.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newVisibleTabs = [...visibleTabs];
    newVisibleTabs.splice(draggedIndex, 1);
    newVisibleTabs.splice(targetIndex, 0, draggedTab);
    // Combine visible and hidden tabs to update full tab list in Redis
    const currentTabId = tabs.find((tab) => tab.current)?.id;

    const updatedTabs = [...newVisibleTabs, ...hiddenTabs].map((tab) => ({
      ...tab,
      current: tab.id === currentTabId,
      is_current: tab.id === currentTabId,
    }));

    setTabs(updatedTabs);
    updatecachedItems(updatedTabs);

    setVisibleTabs(newVisibleTabs);
  };

  // Calculate which tabs should be visible based on container width
  const calculateVisibleTabs = () => {
    const containerWidth = tabsContainerRef.current?.offsetWidth || 700;
    const addButtonWidth = 30; // Increased to match actual button size
    const dropdownButtonWidth = 30;
    const tabPadding = 0;
    const minTabWidth = 88;

    // Find the current/active tab
    const currentTab = tabs.find(
      (tab) => tab.current || tab.id === activeTabId,
    );

    // Default calculation for initial load
    let currentWidth = 0;
    const visible: ITabs[] = [];
    const hidden: ITabs[] = [];

    // Calculate available width without dropdown button initially
    const availableWidth = containerWidth - addButtonWidth;

    // First pass: add tabs in order and check if current tab would be hidden
    for (const tab of tabs) {
      const estimatedTabWidth = Math.max(
        minTabWidth,
        (tab?.name?.length || 0) * 8 + tabPadding + 16,
      );

      if (currentWidth + estimatedTabWidth <= availableWidth) {
        visible.push(tab);
        currentWidth += estimatedTabWidth;
      } else {
        hidden.push(tab);
      }
    }

    // Check if current tab is in hidden tabs
    const currentTabInHidden =
      currentTab && hidden.some((tab) => tab.id === currentTab.id);

    // Only reposition current tab if it's currently hidden
    if (currentTabInHidden && currentTab) {
      // Remove current tab from hidden
      const hiddenWithoutCurrent = hidden.filter(
        (tab) => tab.id !== currentTab.id,
      );

      // Calculate current tab width
      const currentTabWidth = Math.max(
        minTabWidth,
        (currentTab?.name?.length || 0) * 8 + tabPadding + 16,
      );

      // Try to fit current tab at the end
      let recalculatedWidth = 0;
      const newVisible: ITabs[] = [];
      const newHidden: ITabs[] = [];

      // Add visible tabs except current tab, reserving space for current tab
      for (const tab of visible) {
        if (tab.id === currentTab.id) continue;

        const tabWidth = Math.max(
          minTabWidth,
          (tab?.name?.length || 0) * 8 + tabPadding + 16,
        );

        if (recalculatedWidth + tabWidth + currentTabWidth <= availableWidth) {
          newVisible.push(tab);
          recalculatedWidth += tabWidth;
        } else {
          newHidden.push(tab);
        }
      }

      // Add current tab at the end
      newVisible.push(currentTab);

      // Add remaining hidden tabs
      newHidden.push(...hiddenWithoutCurrent);

      setVisibleTabs(newVisible);
      setHiddenTabs(newHidden);
    } else {
      // Current tab is already visible or doesn't exist, keep original order
      setVisibleTabs(visible);
      setHiddenTabs(hidden);
    }
  };

  // // Handle window resize
  let debounceTimer: NodeJS.Timeout;
  useEffect(() => {
    if (!tabs?.length) return;
    calculateVisibleTabs();
    const handleResize = () => {
      // Debounce
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        calculateVisibleTabs();
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs, open]);

  const handleCloseTab = ({ tab, current }: IArgs) => {
    let newTabs = tabs.filter((newTab) => newTab.id !== tab.id);
    let targetHref = '';
    if (current) {
      const selectedIndex = tabs.findIndex((t) => t.current);
      const prevItem = tabs?.[selectedIndex - 1];
      if (prevItem) {
        newTabs = tabs
          .map((t) => ({
            ...t,
            current: t.id === prevItem.id,
            is_current: t.id === prevItem.id,
          }))
          .filter((t) => t.id !== tab.id);
        targetHref = prevItem.href;
      }
    }

    setTabs(newTabs);
    updatecachedItems(newTabs);
    if (targetHref) {
      router?.push(targetHref);
    }
  };

  const handleCloseOtherTabs = ({ current, tab }: IArgs) => {
    const newTabs = tabs
      .filter((newTab) => newTab.id === tab.id || newTab.default)
      .map((t) => ({
        ...t,
        current: t.id === tab.id,
        is_current: t.id === tab.id,
      }));

    setTabs(newTabs);
    updatecachedItems(newTabs);
    if (!current) {
      const getNewCurrent = newTabs.find((t) => t.current);
      if (getNewCurrent?.href) {
        router?.push(getNewCurrent.href);
      }
    }
  };

  const handleCloseAllTabs = () => {
    const newTabs = tabs
      .filter((newTab) => newTab.default)
      .map((t) => ({
        ...t,
        current: true,
        is_current: true,
      }));
    setTabs(newTabs);
    updatecachedItems(newTabs);
    if (newTabs[0]?.href) {
      router?.push(newTabs[0].href);
    }
  };
  // Close dropdown when clicking outside
  const tabsActions = {
    handleCloseTab,
    handleCloseOtherTabs,
    handleCloseAllTabs,
  };

  const customClass = hasNewButton && application === 'grid' ? '!md:w-[calc(100%-76px)]' : ''
  const isCustom = hasNewButton && application === 'grid'

  return (
    <div className="w-full bg-white border-y border-slate-200 md:border-t-0">
      <span className='md:mt-[-4px] opacity-0 w-0 h-0 hidden absolute'></span>
      <nav
        aria-label="Tabs"
        className={cn(
          'scrollbar-hide fixed  top-[53px] md:top-[89px] z-[49] flex w-full justify-between gap-x-0  bg-white pl-0 md:static md:min-h-[2.3rem] md:bg-none lg:pl-0',
          isBannerPresent ? 'mt-12 md:mt-7' : '',
          customClass
        )}
      >
        
        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className="inner-tab-content-el flex items-center"
          style={{
            width: isMobile ? `${width - 88}px` : `${open ? `${!isCustom ? 'calc(100dvw - 335px)' : 'calc(100dvw - 383px)'}` : `${!isCustom ? 'calc(100dvw - 160px)' : 'calc(100dvw - 208px)'}`}`, // Adjust width for mobile
          }}
        >
          {/* Visible Tabs */}
          <div className="flex overflow-hidden mt-1 items-center">
            {visibleTabs.map((tab, index) => {
              const tabName = tab?.name ==='new' ? capitalize(tab?.name) : tab.label ?? tab?.name
              const isLastTab = index === visibleTabs.length - 1;
              return (
                <React.Fragment key={tab.id + index}>
                <div
                  key={tab.id}
                  draggable={!tab.default}
                  onDragStart={(e) => handleDragStart(e, tab)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tab)}
                  onClick={() => handleTabClick(tab.id)}
                  data-test-id={testIDFormatter(
                    `${entity}-grd-tab-fltr-${index + 1}`,
                  )}
                  className={cn(
                    `group relative flex h-[36px] cursor-pointer select-none items-center whitespace-nowrap rounded-md border-gray-200 px-2 text-sm font-medium text-gray-700 transition-all duration-200`,
                    { 'text-primary-highlight border-primary-highlight border-b-[3px]': tab?.current },
                    { 'pr-0': !tab?.default },
                    { 'rounded-t-md rounded-b-none border-b-0 border-l border-r border-t-[3px] px-5': tab?.default },
                  )}
                  style={{ minWidth: tab?.name ==='new' ? '55px' : '88px', maxWidth: tab?.name ==='new' ? '55px' : '200px' }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <>
                        <span>
                          {tab?.name === 'new'
                            ? capitalize(tab?.name)
                            : (tab.label ?? tab?.name)}
                        </span>
                        {!tab.default && (
                          <TabMenu
                            current={tab?.current}
                            href={tab.href}
                            tab={tab}
                            name={tab?.name}
                            entity={entity || ''}
                            tabsAction={tabsActions}
                          />
                        )}
                      </>
                      {/* <InnerTabitem
                        // handleClick={handleTabClick}
                        index={index}
                        tab={tab}
                        newItems={tabs}
                        pathname={newPathname}
                        key={tab.name + index}
                        tabsAction={tabsAction}
                      /> */}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatGridTabName(tab?.name)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {!isLastTab && !tab?.default && (
                  <Separator
                    orientation="vertical"
                    className="h-6"
                  />
                )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Add button and Dropdown grouped together when dropdown has items */}
        </div>
        {hiddenTabs.length > 0 && (
          <div className="flex items-center gap-x-1">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger className="bg-gray-100 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-700">
                <ChevronDown
                  size={16}
                  className={`transform transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" alignOffset={5}>
                {hiddenTabs?.filter((tab) => tab?.id && tab?.name)?.map((tab) => {
                  const tabNameRole =
                    tab.name === 'user_role'
                      ? 'role'
                      : tab.name.split(' ').join('-');
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => handleDropdownItemClick(tab)}
                      className={`flex cursor-pointer justify-between text-sm ${
                        activeTabId === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="mr-1 max-w-[150px] truncate">
                        {formatGridTabName(tabNameRole)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {
          application !== 'grid' && hasNewButton ? (
            <CreateButtonTabs 
              entity={entity || ''}
              application={application}
              className='absolute right-[6px]'
            />
          ) : null
        }
        {/* <RecordDetails /> */}
      </nav>
    </div>
  );
};

export default InnerEnhanceTabItems;
