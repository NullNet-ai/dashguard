'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

import { type IPropsTabList } from './type';
import { reorderMainTabActive, reorderShowActiveItem } from '~/utils/sort-tab-items';
import MainTabContent from './MainTabContent';


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
  const [isWindowLoaded, setIsWindowLoaded] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, , entity] = pathname?.split('/');
  const insertTabs = api.tab.insertMainTabs.useMutation();
  const [newTabList, setNewTabList] = useState<IPropsTabList[]>(items);
  const [cachedItem, setCachedItem] = useState<any>({})
  const [isClient, setIsClient] = useState(false)
  const [application, code] = (pathname || '').split('/').slice(3)
  const {width} = useWindowSize();
  const { isBannerPresent } = useSidebar()
  // Adjust sidebar width based on whether it is open or closed.
  useEffect(() => {
    setIsClient(true)
  }, [])

  const getActiveName = useMemo(() => {
    return () => {
      if (application === 'dashboard') {
        return 'dashboard'
      }
      return entity
    }
  }, [application, entity]);

  useEffect(() => {
    if(!isClient) {
      setCachedItem(items)
    }
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    const selectedCached = cachedItems?.main_tab_data
    const notEqual = selectedCached?.tabs?.length ? selectedCached?.tabs?.length < newTabList?.length : false
    

    if(!selectedCached?.tabs?.length || notEqual) {
      const getCurrent = getActiveName() || ''

      const cachedData = {
        tabs:  items?.map(tab => ({...tab, id: tab?.name})),
        prevCurrent: getCurrent,
        key:  'main_tab_data',
      }
      const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
  
      localStorage.setItem('cachedPortalItems', JSON.stringify({
        ...cachedItems,
        [`main_tab_data`]: cachedData,
      }))
    }

    setCachedItem(selectedCached)
  }, [code, isClient, items, newTabList])
  
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

  const sortTabsActiveWillSecond = useMemo(() => {
    if (!isClient) {
      return newTabList?.map(tab => ({...tab, id: tab?.name}))
    }

    if (newTabList.length) {

      const newTabs = newTabList?.map(tab => ({...tab, id: tab?.name}))
      const activeItem = newTabs.find(a => a.name === entity)
      const copiedItem = newTabs?.length > cachedItem?.tabs?.length ? newTabs : cachedItem?.tabs?.length ? cachedItem?.tabs : [];
      const result =  reorderMainTabActive(copiedItem, activeItem?.name || 'dashboard', entity ?? 'dashboard')
      return result
      
    }
    return newTabList?.map(tab => ({...tab, id: tab?.name})).filter(Boolean)
  }, [newTabList, code, isClient, cachedItem, width, items])
  


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
    insertTabs.mutateAsync(newTab);
    // Drop by into database
  };

  // Close Class Tab
  // Not the current tab
  const closeTab = (tab: IPropsTabList) => {
    const newTab = newTabList.filter(item => item.href !== tab?.href);
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
      router.push(found?.href)
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
      insertTabs.mutateAsync(newTabList);
      return;
    }
  }, [newTabList]);

  return (
    <nav
      aria-label="Tabs"
      className={cn('scrollbar-hide bg-white z-[49] md:bg-none  fixed md:static w-full top-[89px] flex justify-between gap-x-2 md:min-h-[2.0rem]  pl-0 lg:pl-0', isBannerPresent ? 'mt-12 md:mt-7' : 'md:mt-[-4px]',
      )}
    >
    <MainTabContent
        par_items={sortTabsActiveWillSecond}
        pathname={pathname}
        isWindowLoaded={isWindowLoaded}
        application={application}
        code={code}
        actions={actions}
        cachedItems={cachedItem}
      />
    </nav>
  )
};

export default TabItems;
