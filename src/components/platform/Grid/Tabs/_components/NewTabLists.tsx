'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import CreateNewFilter from '../CreateNewFilter';
import GridMenuDropClient from './GridMenuDropClient';
import { duplicateFilterTab, removeGridFilter } from '../SideDrawer/actions';
import { GridContext } from '../../Provider';
import { ulid } from 'ulid';
import { updateAllGridData } from '~/components/platform/Tab/Actions/actions';
import { cn, formatGridTabName } from '~/lib/utils';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';

interface Tab {
  id: string;
  name: string;
  current: boolean;
  href: string;
  default: boolean;
  [key: string]: any; // Allow additional properties for scalability
}

interface DraggableTabsProps {
  initialTabs?: Tab[];
}

const DraggableTabs: React.FC<DraggableTabsProps> = ({ initialTabs }) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs ?? []);
  const newPathname = usePathname();
  const { state: gridState, actions: gridActions } = useContext(GridContext);

  const [visibleTabs, setVisibleTabs] = useState<Tab[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTab, setDraggedTab] = useState<Tab | null>(null);
  const router = useRouter();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [portal, entity, application, code] = newPathname || '';
  const { config, gridKey } = gridState ?? {};
  const { width } = useWindowSize();
  const screenType = useScreenType();
  const isMobile = screenType === 'xs' || screenType === 'sm' || screenType === 'md';

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllGridData(items);
    } catch (error) {
      console.error(error);
    }
  };

  // Update tabs when initialTabs prop changes
  useEffect(() => {
    if (initialTabs && initialTabs.length > 0) {
      setTabs(initialTabs);
      // Set activeTabId to the current tab
      const currentTab = initialTabs.find(tab => tab.current);
      if (currentTab) {
        setActiveTabId(currentTab.id);
      }
    }
  }, [initialTabs]);

  // Update activeTabId when tabs change
  useEffect(() => {
    const currentTab = tabs.find(tab => tab.current);
    if (currentTab && activeTabId !== currentTab.id) {
      setActiveTabId(currentTab.id);
    }
  }, [tabs, activeTabId]);

  // Add new tab function
  const addNewTab = () => {
    const newTabNumber = tabs.length + 1;
    const newTab: Tab = {
      id: `${newTabNumber}`,
      name: `New Tab ${newTabNumber}`,
      current: false,
      href: `/portal/new-tab-${newTabNumber}`,
      default: false,
    };

    // Add the new tab to the end of all tabs
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);

    // Set the new tab as active
    setActiveTabId(newTab.id);

    // Check if new tab can fit without displacing existing visible tabs
    setTimeout(() => {
      calculateVisibleTabsWithNewItem(newTab.id, updatedTabs, true, true);
    }, 0);
  };

  // Special calculation for new items to ensure they're always visible at the end
  const calculateVisibleTabsWithNewItem = (
    newItemId: string,
    allTabs: Tab[],
    shouldPlaceAtEnd = true,
    isNewTab = false,
  ) => {
    const containerWidth = tabsContainerRef.current?.offsetWidth || 1000;
    const addButtonWidth = 32; // Increased to match actual button size
    const dropdownButtonWidth = 32;
    const tabPadding = 0;
    const minTabWidth = 80;

    // Find the new item
    const newItem = allTabs.find((tab) => tab.id === newItemId);
    if (!newItem) return;

    // Calculate new item width
    const newItemWidth = Math.max(
      minTabWidth,
      newItem.name.length * 8 + tabPadding + 16,
    );

    // Available width for tabs (excluding add button and dropdown button)
    const availableWidth =
      containerWidth - addButtonWidth - dropdownButtonWidth;

    if (shouldPlaceAtEnd) {
      if (isNewTab && visibleTabs.length > 0) {
        // For new tabs, check if it can fit without displacing existing visible tabs
        const currentVisible = [...visibleTabs];

        // Calculate current width of visible tabs
        let currentWidth = 0;
        for (const tab of currentVisible) {
          const tabWidth = Math.max(
            minTabWidth,
            tab.name.length * 8 + tabPadding + 16,
          );
          currentWidth += tabWidth;
        }

        // Check if new tab can fit alongside existing visible tabs
        if (currentWidth + newItemWidth <= availableWidth) {
          // New tab can fit, add it without displacing any existing tabs
          const newVisible = [...currentVisible, newItem];
          setVisibleTabs(newVisible);
          setHiddenTabs(hiddenTabs);
        } else {
          // Not enough space, replace the last visible tab
          const lastVisibleTab = currentVisible[currentVisible.length - 1];

          // Replace last visible tab with new tab
          const newVisible = [...currentVisible.slice(0, -1), newItem];

          // Move the last visible tab to hidden tabs
          const newHidden = [...hiddenTabs, lastVisibleTab];

          setVisibleTabs(newVisible);
          setHiddenTabs(
            newHidden.filter((tab): tab is Tab => tab !== undefined),
          );
        }
      } else {
        // For dropdown selections, use the original logic
        const visible: Tab[] = [newItem];
        let currentWidth = newItemWidth;

        // Add other tabs from the end, working backwards, until we run out of space
        const otherTabs = allTabs
          .filter((tab) => tab.id !== newItemId)
          .reverse();

        for (const tab of otherTabs) {
          const tabWidth = Math.max(
            minTabWidth,
            tab.name.length * 8 + tabPadding + 16,
          );

          if (currentWidth + tabWidth <= availableWidth) {
            visible.unshift(tab); // Add to the beginning to maintain order
            currentWidth += tabWidth;
          }
        }

        // Create hidden tabs array (tabs not in visible)
        const visibleIds = new Set(visible.map((tab) => tab.id));
        const hidden = allTabs.filter((tab) => !visibleIds.has(tab.id));

        setVisibleTabs(visible);
        setHiddenTabs(hidden);
      }
    } else {
      // Just recalculate without reordering
      calculateVisibleTabs();
    }
  };

  // Calculate which tabs should be visible based on container width
  const calculateVisibleTabs = () => {
    const containerWidth = tabsContainerRef.current?.offsetWidth || 700;
    const addButtonWidth = 30; // Increased to match actual button size
    const dropdownButtonWidth = 30;
    const tabPadding = 0;
    const minTabWidth = 80;

    // Find the current/active tab
    const currentTab = tabs.find(tab => tab.current || tab.id === activeTabId);

    // Default calculation for initial load
    let currentWidth = 0;
    const visible: Tab[] = [];
    const hidden: Tab[] = [];

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
    const currentTabInHidden = currentTab && hidden.some(tab => tab.id === currentTab.id);

    // Only reposition current tab if it's currently hidden
    if (currentTabInHidden && currentTab) {
      // Remove current tab from hidden
      const hiddenWithoutCurrent = hidden.filter(tab => tab.id !== currentTab.id);

      // Calculate current tab width
      const currentTabWidth = Math.max(
        minTabWidth,
        (currentTab?.name?.length || 0) * 8 + tabPadding + 16,
      );

      // Try to fit current tab at the end
      let recalculatedWidth = 0;
      const newVisible: Tab[] = [];
      const newHidden: Tab[] = [];

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

  useEffect(() => {
    calculateVisibleTabs();
  }, [tabs]);

  // Recalculate when component mounts to get actual container width
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateVisibleTabs();
    }, 100); // Small delay to ensure container is rendered

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateVisibleTabs();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs]);

  // Handle tab click (visible tabs)
  const handleTabClick = (tabId: string) => {
     setActiveTabId(tabId);
  setIsDropdownOpen(false);

  if (!isDragging) {
    const tab = tabs.find((t) => t.id === tabId);

    // Use the current order of visibleTabs and hiddenTabs
    const newTablist = [...visibleTabs, ...hiddenTabs].map((tab_item: any) => ({
      ...tab_item,
      current: tab_item.id === tabId,
      is_current: tab_item.id === tabId,
    }));

    setTabs(newTablist);
    updatecachedItems(newTablist);

    if (tab?.href) {
      router?.push(tab?.href);
    }
  }
    // Don't reorder when clicking visible tabs
  };

  // Handle dropdown item click (switch with last visible tab)
  const handleDropdownItemClick = (selectedTab: Tab) => {
    if (visibleTabs.length === 0) return;
    
    const lastVisibleTab = visibleTabs[visibleTabs.length - 1];
  
    // Update the current property for all tabs
    const updatedAllTabs = tabs.map(tab => ({
      ...tab,
      current: tab.id === selectedTab.id
    }));
  
    // Create new arrays with the simple switch
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
  const handleDragStart = (e: React.DragEvent, tab: Tab) => {
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

  const handleDrop = (e: React.DragEvent, targetTab: Tab) => {
    e.preventDefault();

    // Prevent dropping onto default tabs
    if (!draggedTab || draggedTab.id === targetTab.id || targetTab.default) return;

    const draggedIndex = visibleTabs.findIndex(
      (tab) => tab.id === draggedTab.id,
    );
    const targetIndex = visibleTabs.findIndex((tab) => tab.id === targetTab.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newVisibleTabs = [...visibleTabs];
    newVisibleTabs.splice(draggedIndex, 1);
    newVisibleTabs.splice(targetIndex, 0, draggedTab);
    // Combine visible and hidden tabs to update full tab list in Redis
         const currentTabId = tabs.find(tab => tab.current)?.id;

            const updatedTabs = [...newVisibleTabs, ...hiddenTabs].map(tab => ({
            ...tab,
            current: tab.id === currentTabId,
            is_current: tab.id === currentTabId,
        }));
        setTabs(updatedTabs); 
    updatecachedItems(updatedTabs);

    setVisibleTabs(newVisibleTabs);
  };

  // Get active tab content
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const handleDeleteTabs = async (tab: any) => {
    const newTabs = tabs.filter((item: any) => item.id !== tab.id);
    // Background update
    await removeGridFilter(tab?.id, gridKey);
    // updatecachedItems(newTabs);
    // TODO

    if (newTabs?.[0]?.href) {
      router?.push(newTabs[0].href);
    }
  };

  const handleDuplicateTab = async ({
    tab,
    gridKey,
    defaultEntity,
  }: {
    tab: any;
    gridKey: string;
    defaultEntity: string;
  }) => {
    // const newTabs = tablists.filter((item:any) => item.id !== tab.id);
    // setTablists(newTabs);

    const tabToBeDuplicated = tabs?.find((item: any) => item.id === tab.id);
    const filter_id = ulid();
    const href = `${newPathname}?filter_id=${filter_id}`;

    const newTab = {
      ...tabToBeDuplicated,
      id: filter_id,
      name: `${tabToBeDuplicated?.name} (Copy)`,
      link: href,
      current: true,
      is_current: true,
      href: href,
      default: false,
      is_default: false,
      default_filter: tabToBeDuplicated?.default_filter?.length
        ? tabToBeDuplicated?.default_filter
        : tabToBeDuplicated?.advance_filters?.filter(
            (item: any) => item.default,
          ),
    };
    const newTablist = [...tabs, newTab];
    // Background update
    await duplicateFilterTab(newTab, gridKey, defaultEntity);
    // set current and is_current to false for other tabs
    const updatedTabs = newTablist.map((item: any) => {
      if (item.id !== newTab.id) {
        return {
          ...item,
          current: false,
          is_current: false,
        };
      }
      return item;
    });
    setTabs(updatedTabs);
    // setActiveTab(newTab?.id);
    router?.push(newTab?.href);
  };

  const handleUpdateTab = async (tab: any) => {
    const newTabs = tabs.map((item: any) => {
      if (item.id === tab.id) {
        return {
          ...item,
          ...tab,
        };
      }
      return item;
    });
    gridActions?.setColumnsOrder?.(tab?.columns);
    setTabs(newTabs);
  };
  // Close dropdown when clicking outside
  const actions = {
    handleDeleteTabs,
    handleDuplicateTab,
    handleUpdateTab,
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg">
        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className="grid-tab-content-el grid-tabs flex items-center"
          style={{
            width:
              isMobile ? `${width - 95}px` : '100%', // Adjust width for mobile
          }}
        >
          {/* Visible Tabs */}
          <div className="flex gap-x-1 overflow-hidden">
            {visibleTabs.map((tab) => {
              const tabNameRole =
                tab.name === 'user_role'
                  ? 'role'
                  : tab.name.split(' ').join('-');
              return (
                <div
                  key={tab.id}
                  draggable={!tab.default}
                  onDragStart={(e) => handleDragStart(e, tab)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, tab)}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    `relative flex h-[36px] cursor-pointer select-none  items-center whitespace-nowrap rounded-md border-gray-200 bg-tertiary px-3 py-2  text-sm font-medium text-gray-700 transition-all duration-200 pr-1`,
                    { 'text-primary': tab?.current },
                  )}
                  style={{ maxWidth: '200px' }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="mr-1 max-w-[150px] truncate">
                        {formatGridTabName(tabNameRole)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatGridTabName(tabNameRole)}</p>
                    </TooltipContent>
                  </Tooltip>
                  <GridMenuDropClient
                    actions={actions}
                    tab={tab}
                    filter_id={tab?.id}
                    current={!!tab.href.match(newPathname)}
                    tabs={tabs}
                    entity={entity || ''}
                  />
                </div>
              );
            })}

            {/* Add New Tab Button - only show here if no dropdown items */}
            {hiddenTabs.length === 0 && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  {/* //this is the add button */}
                  <CreateNewFilter initialTab={tabs?.[0] ?? {}} />
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <p>Open new tab</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>



          {/* Add button and Dropdown grouped together when dropdown has items */}
          {hiddenTabs.length > 0 && (
            <div className="flex items-center gap-x-1">
              {/* Add New Tab Button */}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  {/* //this is the add button */}
                  <CreateNewFilter initialTab={tabs?.[0] ?? {}} />
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <p>Open new tab</p>
                </TooltipContent>
              </Tooltip>

              {/* Dropdown Button */}
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger className="bg-gray-100 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-700">
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
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
                        className={`cursor-pointer justify-between flex text-sm ${activeTabId === tab.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700'
                          }`}
                      >
                        <span className="mr-1 max-w-[150px] truncate">
                          {formatGridTabName(tabNameRole)}
                        </span>
                        <GridMenuDropClient
                          actions={actions}
                          tab={tab}
                          filter_id={tab?.id}
                          current={!!tab.href.match(newPathname)}
                          tabs={tabs}
                          entity={entity || ''}
                        />
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableTabs;
