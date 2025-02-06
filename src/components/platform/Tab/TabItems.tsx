'use client';

import { ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import { cn, formatAndCapitalize } from '~/lib/utils';
import { api } from '~/trpc/react';
import { remToPx } from '~/utils/fetcher';

import Item from './Item';
import { type IPropsTabList } from './type';

const ITEM_WIDTH = 100;

type TabItemsProps = {
  items: IPropsTabList[]
  children?: React.ReactNode
};

export interface IActions {
  closeTab: (tab: IPropsTabList) => void
  closeCurrentTab: (tab: IPropsTabList) => void
  closeAllTabs: () => void
  closeOtherTabs: (tab: IPropsTabList) => void
}

const TabItems = ({ items }: TabItemsProps) => {
  const winWidth = useWindowSize().width;
  const contRef = React.useRef<HTMLDivElement>(null);
  const { open } = useSidebar();
  const screenSize = useScreenType();
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/');
  const insertTabs = api.tab.insertMainTabs.useMutation();
  const [newTabList, setNewTabList] = useState<IPropsTabList[]>(items);

  const [application, code] = (pathname || '').split('/').slice(3)
  // Adjust sidebar width based on whether it is open or closed.
  const sidebarWidth = useMemo(
    () => screenSize === 'xs' || screenSize === 'sm' || screenSize === 'md'
      ? 0
      : remToPx(open ? 16 : 5), [screenSize, open],
  );

  const [visibleItems, dropdownItems] = useMemo(() => {
    if (!contRef.current?.offsetWidth) return [newTabList, []];
    const containerWidth = contRef.current?.offsetWidth || 0;

    const maxAvailableWidth = containerWidth - 60;
    const maxVisibleItems = Math.floor(maxAvailableWidth / ITEM_WIDTH);

    return [
      newTabList.slice(0, maxVisibleItems),
      newTabList.slice(maxVisibleItems),
    ];
  }, [newTabList, winWidth, sidebarWidth]);

  const isUserRole = (entity: string) => entity === 'user_role';

  // Insert new tabs into the tab list.
  const insertMainTabs = () => {
    const found = newTabList.find((tab) => {
      const [, , entityName] = tab.href.split('/');
      return entityName === entity;
    });

    if (found) {
      return;
    }
    const newTab = [
      ...newTabList,
      {
        name: entity,
        href: pathname,
        current: true,
      },
    ]?.map((item) => {
      return {
        ...item,
        current: item.href === pathname,
      };
    }) as IPropsTabList[];
    setNewTabList(newTab);
    void insertTabs.mutateAsync(newTab);
    // Drop by into database
  };

  // Close Class Tab
  // Not the current tab
  const closeTab = (tab: IPropsTabList) => {
    const newTab = newTabList.filter(item => item.href !== tab.href);
    // make it current tab
    const activeTab = newTab[newTab.length - 1];
    if (activeTab) {
      activeTab.current = true;
      router.push(activeTab?.href);
    }
    setNewTabList(newTab);
  };
  // Close Current Tab
  // Current tab
  const closeCurrentTab = (tab: IPropsTabList) => {
    // 1. Find the current tab
    // 2. remove the current tab
    // 3. active tab will be the left tab if the current tab is the last tab
    // 4. active tab will be the right tab if the current tab is the first tab
    const currentTabIndex = newTabList.findIndex(
      item => item.href === tab.href,
    );
    if (currentTabIndex === -1) {
      return;
    }
    const newTab = [...newTabList];
    newTab.splice(currentTabIndex, 1);
    let activeTabIndex = currentTabIndex - 1;
    if (activeTabIndex < 0) {
      activeTabIndex = 0;
    }
    const activeTab = newTab[activeTabIndex];
    if (activeTab) {
      activeTab.current = true;
      router.push(activeTab?.href);
    }

    setNewTabList(newTab);
  };

  // Close All tabs
  // Except dashboard

  const closeAllTabs = () => {
    const newTab = newTabList.filter(item => item.name === 'dashboard');
    setNewTabList(newTab);
    const found = newTab.find(item => item.name === 'dashboard');
    if (!found) {
      router.push('/portal/dashboard');
      return;
    }
    router.push(found?.href);
  };

  // Close Other tabs
  const closeOtherTabs = (tab: IPropsTabList) => {
    const newTab = newTabList.filter(
      item => item.name === tab?.name || item.name === 'dashboard',
    );
    if (newTab.length > 0 && newTab[0]) {
      newTab?.map((item) => {
        return {
          ...item,
          current: item.name === tab.name,
        };
      });
      const found = newTab.find(item => item.name == tab.name);
      if (!found) {
        newTab[0].current = true;
        router.push(newTab[0]?.href);
        return;
      }
      router.push(found?.href);
    }
    setNewTabList(newTab);
  };

  const actions = {
    closeTab,
    closeCurrentTab,
    closeAllTabs,
    closeOtherTabs,
  } as IActions;

  useEffect(() => {
    insertMainTabs();
  }, [entity]);

  useEffect(() => {
    if (newTabList.length !== 0) {
      void insertTabs.mutateAsync(newTabList);
      return;
    }
  }, [newTabList]);

  return (
    <div
      className="main-tab-container flex flex-1 overflow-hidden"
      ref={contRef}
    >
      <div className="flex w-full flex-1">
        {visibleItems.map(tab => (
          <Item
            actions={actions}
            tab={tab}
            key={isUserRole(tab.name) ? 'role' : tab.name}
          />
        ))}
      </div>
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-auto flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary"
            aria-label="More tabs"
            data-test-id="mainTabDropdownButton"
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {dropdownItems.map((tab: any) => {
              const isGrid = tab.name === 'Grid' || tab.name === 'grid'
              const isGridActive
                = application === 'Grid' || application === 'grid'
              const isActive = isGridActive ? !!isGrid : code === tab?.name
              return (
                <DropdownMenuItem
                  className="group relative flex items-center p-2 py-3"
                  key={isUserRole(tab.name) ? 'role' : tab.name}
                >
                  <Link
                    aria-current={tab.current ? 'page' : undefined}
                    className={cn(
                      isActive
                        ? 'rounded-t-lg border-primary text-primary'
                        : 'text-gray-500', 'whitespace-nowrap px-4 pt-2 text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary',
                    )}
                    data-test-id={`mntab-${
                      isUserRole(tab.name)
                        ? 'role'
                        : tab.name.replace(/\s+/g, '')
                    }`}
                    href={tab.href}
                  >
                    {formatAndCapitalize(
                      isUserRole(tab.name) ? 'role' : tab.name,
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default TabItems;
