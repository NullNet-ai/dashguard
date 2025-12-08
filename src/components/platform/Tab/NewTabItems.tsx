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
  updateAllMaindata,
} from '~/components/platform/Tab/Actions/actions';
import { cn, formatGridTabName, formatTabName } from '~/lib/utils';
import InnerTabitem from './InnerTabitem';
import { useSidebar } from '~/components/ui/sidebar';
import TabMenu from '~/components/application-layout/common/TabMenu';
import { capitalize, lowerCase, upperCase } from 'lodash';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import pluralize, { singular } from 'pluralize';
import { tabClick } from './Actions/MainTabActions';

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
  classNames?: string;
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

const NewTabItems: React.FC<DraggableTabsProps> = ({
  initialTabs,
  classNames,
}) => {
  const [tabs, setTabs] = useState<ITabs[]>(initialTabs ?? []);

  const newPathname = usePathname();
  const searchParams = useSearchParams();
  const { isBannerPresent } = useSidebar();
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
      await updateAllMaindata(items);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fullPathName = `${entity}`;
    const existTab = tabs.find((tab) => tab?.name === entity);

    let href = `/${portal}/${entity}/`;
    switch (entity) {
      case 'dashboard':
        href = `/${portal}/dashboard`;
        break;
      default:
        href = `/${portal}/${entity}/grid`;
        break;
    }

    let updatedTabs = tabs;
    if (!existTab) {
      updatedTabs.push({
        id: ulid(),
        name: entity!,
        current: true,
        href: href,
        default: false,
        label: code,
      });
    }

    // Ensure the current tab is set correctly
    updatedTabs = updatedTabs.map((tab) => ({
      ...tab,
      current: tab.name === entity,
      is_current: tab.name === entity,
    }));

    setTabs(updatedTabs);
    updateAllMaindata(updatedTabs);
    // console.log("newPathname", {newPathname, searchParams: searchParams.size})
  }, [entity]);

  // Handle tab click (visible tabs)
  const handleTabClick = (tabId: string) => {
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    // const newTabs = tabs.map((tab) => ({
    //     ...tab,
    //     current: tab.id === tabId,
    //     is_current: tab.id === tabId,
    // }));
    // setTabs(newTabs);
    // updatecachedItems(newTabs);
    const pathParts = selectedTab?.href?.split('/');
    const entityName = pathParts && pathParts.length >= 3 ? pathParts[2] : null;

    // get from local storage
    const entity_last_paths = localStorage.getItem(
      `last_visited_url:${entityName}`,
    );
    if (selectedTab?.href) {
      tabClick(entity_last_paths || selectedTab.href);
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

    // Create new arrays with the simple switch
    const newVisibleTabs = [
      ...visibleTabs.slice(0, -1),
      {
        ...selectedTab,
        current: true,
      },
    ];
    const newHiddenTabs = hiddenTabs.filter((tab) => tab.id !== selectedTab.id);
    if (lastVisibleTab) {
      // Add to first position instead of last position
      newHiddenTabs.unshift({
        ...lastVisibleTab,
        current: false,
      });
    }
    // Update the main tabs state
    setTabs([...newVisibleTabs, ...newHiddenTabs]);

    updatecachedItems([...newVisibleTabs, ...newHiddenTabs]);

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
    if (tab.default || tab.name === 'dashboard') {
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
    if (
      !draggedTab ||
      draggedTab.id === targetTab.id ||
      targetTab.default ||
      targetTab.name === 'dashboard'
    ) {
      return;
    }

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
    const addButtonWidth = 0; // Increased to match actual button size
    const dropdownButtonWidth = 30;
    const tabPadding = 0;
    const minTabWidth = 80;

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

  // Handle window resize
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
  }, [tabs]);

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
      .filter((newTab) => newTab.id === tab.id || newTab.name === 'dashboard')
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
      .filter((newTab) => newTab.name === 'dashboard')
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

  return (
    <nav
      aria-label="Tabs"
      className={cn(
        'scrollbar-hide fixed top-[57px] z-[49] flex w-full justify-between bg-white pl-0 pr-2 md:static md:min-h-[2.3rem] md:bg-none lg:pl-0',
        isBannerPresent ? 'mt-12 md:mt-7' : 'md:mt-[-4px]',
      )}
    >
      {/* Tabs Container */}
      <div
        ref={tabsContainerRef}
        className="grid-tab-content-el flex items-center"
        style={{
          width: isMobile ? `${width - 32}px` : '100%', // Adjust width for mobile
        }}
      >
        {/* Visible Tabs */}
        <div className="flex gap-x-1 overflow-hidden">
          {visibleTabs
            ?.filter((tab) => tab?.id)
            ?.map((tab, index) => {
              const _tabNameRole = tab?.name
                ?.split(' ')
                .join('-')
                .toLowerCase();
              let tabNameRole = _tabNameRole;
              switch (tab?.name) {
                case 'user_role':
                  tabNameRole = 'roles';
                  break;
                case 'account_organization':
                  tabNameRole = 'accounts';
                  break;
                case 'dashboard':
                  tabNameRole = 'dashboard';
                  break;
                default:
                  tabNameRole = singular(_tabNameRole);
                  break;
              }

              return (
                <div
                  key={tab.id + index}
                  draggable={!tab.default}
                  onDragStart={(e) => handleDragStart(e, tab)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tab)}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    `${tab?.current ? 'rounded-t-md border-b-0 border-l border-r border-t-2 border-t-primary text-primary' : ''}`,
                    `group relative flex h-[30px] cursor-pointer items-center whitespace-nowrap md:h-[32px]`,
                    `${lowerCase(tab?.name) === 'dashboard' ? 'px-2 pl-[6px]' : 'pl-2'} `,
                    classNames,
                  )}
                  //   className={cn(
                  //     `group relative flex h-[36px] cursor-pointer select-none items-center whitespace-nowrap rounded-md border-gray-200 px-2 text-sm font-medium text-gray-700 transition-all duration-200`,
                  //     { 'text-primary': tab?.current },
                  //     { 'pr-0': !tab?.default },
                  //   )}
                  style={{ maxWidth: '200px' }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <>
                        <span className="text-sm font-medium">
                          {formatTabName(tabNameRole)}
                        </span>
                        {/* {index !== visibleTabs.length - 1 && !tab?.current && (
                                                    <span className="absolute right-0 h-[50%] w-[1px] bg-default/20" />
                                                )} */}
                        {tab.name !== 'dashboard' && (
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatGridTabName(tab?.name)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
        </div>

        {/* Add button and Dropdown grouped together when dropdown has items */}
      </div>
      {hiddenTabs.length > 0 && (
        <div className="flex items-center gap-x-1">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="bg-gray-100 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-700">
              <ChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={5}>
              {hiddenTabs
                ?.filter((tab) => tab?.id && tab?.name)
                ?.map((tab) => {
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
    </nav>
  );
};

export default NewTabItems;
