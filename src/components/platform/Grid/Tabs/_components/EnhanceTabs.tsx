'use client';

import React, { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { X, Plus } from 'lucide-react';
import { cn, formatGridTabName } from '~/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { current } from 'immer';
import CreateNewFilter from '../CreateNewFilter';
import GridMenuDropClient from './GridMenuDropClient';
import { usePathname, useRouter } from 'next/navigation';
import { duplicateFilterTab, removeGridFilter } from '../SideDrawer/actions';
import { GridContext } from '../../Provider';
import { ulid } from 'ulid';
import { updateAllGridData } from '~/components/platform/Tab/Actions/actions';


interface BrowserTabProps {
  tabs?: any[];
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNewTab?: () => void;
  onTabReorder?: (tabs: any[]) => void;
  className?: string;
}

const EnhanceGridTabs: React.FC<BrowserTabProps> = ({
  tabs: initialTabs,
  onTabClick,
  onTabClose,
  onNewTab,
  onTabReorder,
  className
}) => {



  // Memoize initialTabs to prevent unnecessary re-renders
  const newPathname = usePathname();
  const memoizedInitialTabs = useMemo(() => initialTabs || [], [JSON.stringify(initialTabs)]);
  const { state: gridState, actions: gridActions } = useContext(GridContext);
  const [tabs, setTabs] = useState<any[]>(memoizedInitialTabs);
  const [portal, entity, application, code] = (newPathname || '')
  
  // Update tabs only when memoizedInitialTabs actually changes
  useEffect(() => {
    setTabs(memoizedInitialTabs);
  }, [memoizedInitialTabs]);
  
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragThreshold = 5; // pixels
  const router = useRouter();
  const { config, gridKey } = gridState ?? {}; 

  const updatecachedItems = async (items: any) => {
    try {
      await updateAllGridData(items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabClick = (tabId: string) => {
    // Only handle click if we're not in the middle of a drag operation
    if (!isDragging) {
      const tab = tabs.find(t => t.id === tabId);
      const newTablist = tabs.map((tab_item: any) => {
        return {
          ...tab_item,
          current: tab_item.id === tabId,
          is_current: tab_item.id === tabId,
        };
      });
      setTabs(newTablist)
      updatecachedItems(newTablist);
      onTabClick?.(tabId);
      router?.push(tab?.href);
    }
  };



  // Enhanced Drag and Drop handlers with conflict prevention
  const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tabId);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTab(tabId);
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    
    if (!draggedTab || draggedTab === targetTabId) {
      setDraggedTab(null);
      setDragOverTab(null);
      setIsDragging(false);
      return;
    }

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTab);
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Prevent dropping onto the default tab (index 0)
    if (targetIndex === 0) {
      setDraggedTab(null);
      setDragOverTab(null);
      setIsDragging(false);
      return;
    }

    const newTabs = [...tabs];
    const [draggedTabData] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTabData);
    
    setTabs(newTabs);
    updatecachedItems(newTabs);
    onTabReorder?.(newTabs);
    setDraggedTab(null);
    setDragOverTab(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
    // Add a small delay before resetting isDragging to prevent immediate click
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartPos.current) {
      const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
      
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        setIsDragging(true);
      }
    }
  };

  const handleMouseUp = () => {
    dragStartPos.current = null;
    // Reset dragging state after a short delay to prevent click conflicts
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleDeleteTabs = async ( tab:any ) => {
    const newTabs = tabs.filter((item:any) => item.id !== tab.id);
    // Background update
    await removeGridFilter(tab?.id , gridKey)
    // updatecachedItems(newTabs);
    // TODO
    router?.push(newTabs?.[0]?.href);
  };

  const handleDuplicateTab = async({
    tab,
    gridKey,
    defaultEntity,
  } : {
    tab: any;
    gridKey: string;
    defaultEntity: string;
  } ) => {
    // const newTabs = tablists.filter((item:any) => item.id !== tab.id);
    // setTablists(newTabs);

    const tabToBeDuplicated = tabs?.find((item:any) => item.id === tab.id);
    const filter_id = ulid();
    const href = `${newPathname}?filter_id=${filter_id}`;

    const newTab = {
      ...tabToBeDuplicated,
      id: filter_id,
      name: `${tabToBeDuplicated?.name} (Copy)`,
      link : href,
      current: true,
      is_current: true,
      href: href,
      default : false,
      is_default: false,
    }
    const newTablist = [
      ...tabs,
      newTab
    ];
    // Background update
    await duplicateFilterTab(newTab, gridKey, defaultEntity);
    // set current and is_current to false for other tabs
    const updatedTabs = newTablist.map((item:any) => {
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
  }


  const actions = {
    handleDeleteTabs,
    handleDuplicateTab,
    handleUpdateTab
  }

  

  return (
    <div className="flex items-center w-full"> {/* Fixed width using Tailwind */}
    {/* Tabs Container */}
    <div className="flex flex-1 overflow-hidden gap-1"> {/* Added gap-2 for spacing */}
      {tabs.map((tab, index) => {
        const tabNameRole =
        tab.name === 'user_role' ? 'role' : tab.name.split(' ').join('-');
        const isDefaultTab = index === 0; // First tab is the default tab
        return (
            <div
              key={tab.id}
              className={cn(
                "group relative flex-1 min-w-0 max-w-[130px]",
                draggedTab === tab.id && "opacity-50",
                dragOverTab === tab.id && "bg-blue-50"
              )}
              draggable={!isDefaultTab} // Make default tab non-draggable
              onMouseDown={!isDefaultTab ? (e) => handleMouseDown(e, tab.id) : undefined}
              onMouseMove={!isDefaultTab ? handleMouseMove : undefined}
              onMouseUp={!isDefaultTab ? handleMouseUp : undefined}
              onDragStart={!isDefaultTab ? (e) => handleDragStart(e, tab.id) : undefined}
              onDragOver={(e) => handleDragOver(e, tab.id)} // Keep drag over for drop target
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)} // Keep drop handler
              onDragEnd={!isDefaultTab ? handleDragEnd : undefined}
            >
              {/* Tab with Tooltip */}
              <Tooltip key={tab.id} delayDuration={0} >
           
                  <div
                    className={cn(
                      'relative bg-tertiary h-[36px] rounded-md flex items-center px-3 cursor-pointer transition-all duration-200',
                      ' select-none min-w-0',
                      tab.current
                        ? '  h-[36px]  text-primary'
                        : ' hover:bg-gray-250 text-gray-700 hover:text-gray-900',
                      draggedTab === tab.id && 'cursor-grabbing',
                      dragOverTab === tab.id && 'border-l-2 border-l-blue-500',
                      isDragging && 'pointer-events-none', // Prevent clicks during drag
                      isDefaultTab && 'cursor-default' // Different cursor for default tab
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTabClick(tab.id)
                    }}
                  >
                         <TooltipTrigger asChild>
                    <span className="flex-1 text-sm font-medium truncate min-w-0">
                         {formatGridTabName(tabNameRole)}
                    </span>
                    </TooltipTrigger>
                    {/* GridMenuDropClient moved inside the tab */}
                    <GridMenuDropClient
                        actions={actions}
                        tab={tab}
                        filter_id={tab?.id}
                        current={!!tab.href.match(newPathname)}
                        tabs={tabs}
                        entity={entity || ''}
                    />
                  </div>
    
                <TooltipContent align='center' side='bottom' sideOffset={5} className="z-[9999]">
                  <p>{tab.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )
      })}
      
      {/* New Tab Button with Tooltip - Moved inside tabs container */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {/* //this is the add button */}
              <CreateNewFilter initialTab={tabs?.[0] ?? {}}/>
        </TooltipTrigger>
        <TooltipContent align='center' side='bottom' sideOffset={5} className="z-[9999]">
          <p>Open new tab</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
  );
};

export default EnhanceGridTabs;