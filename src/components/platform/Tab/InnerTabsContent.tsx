'use client';

import { ChevronDownIcon, Search, X } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';


import {
  Sortable,
  SortableItem,
} from '~/components/ui/sortable';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';

import InnerDropTabItem from './InnerDropTabItem';
import InnerTabitem from './InnerTabitem';
import { SideDrawerView, useSideDrawer } from '../SideDrawer';
import { Input } from '~/components/ui/input';
import { Button } from '@headlessui/react';
import { debounce, lowerCase, toLower } from 'lodash';  // Add this import at the top
import { reorderShowActiveItem } from '~/utils/sort-tab-items';
import { updateAllInnerdata } from './Actions/actions';
const InnerTabsContent = ({
  par_items = [],
  pathname,
  isWindowLoaded,
  application,
  code,
  variant
}: any) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const { open } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const  {state: drawerState,  } = useSideDrawer ()
  const {width, isOpen, isPinned} = drawerState as any
  const [searchValue, setSearchValue] = useState<string>('')
  const [, portal, entity] = pathname?.split('/') || [];
  const [datas, setDatas] = useState(par_items)

  const conWidth = useMemo(() =>   ({
    width: `calc(100vw - ${open ? '320px' : '140px'} ${width && (isOpen && isPinned) ? `- ${width} ` : ''})`
  }), [open, width]);


  const updateCache = (items?: any[]) => {

    const newItems = items || par_items;
    if (newItems?.length) {
      const getCurrent = getActiveName() || ''
      const neworderData = reorderShowActiveItem(newItems, code, application)
      const cachedData = {
        tabs: neworderData,
        lastShownItem: lastShownItem?.name,
        prevCurrent: getCurrent,
        key:  'inner_tab_data_' + entity,
      }
      const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')
  
      localStorage.setItem('cachedPortalItems', JSON.stringify({
        ...cachedItems,
        [`inner_tab_data_${entity}`]: cachedData,
      }))
    }
  }

  const updatecachedItems =  async (items: any) => {
    // const getCurrent = getActiveName() || ''
    // const neworderData = reorderGridTabActive(copiedItem, activeItem?.id ?? '', application ?? '')
     const removeHidden = items.filter((item: any) => !item.hidden);
      const lastItem = removeHidden[removeHidden.length - 1];

    const cachedData = {
      tabs: items,
      lastShownItem: lastItem?.name,
      key:  'inner_tab_data_' + entity,
    }

    try {
      await updateAllInnerdata(items, `/${portal}/${entity}`)
    } catch (error) {
        console.error(error)
    }

    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`inner_tab_data_${entity}`]: cachedData,
    }))
  }


  const getActiveName = useMemo(() => {
      return () => {
        if (application === 'grid') {
          return 'grid'
        }
        return code
      }
    }, [application, code]);

  useEffect(() => {

    if(JSON.stringify(par_items) !== JSON.stringify(datas)) {
      setDatas(par_items)
    }
    
    const calc = (items?: any[]) => {
      const allItems: any[] = [];
      const newData = items || par_items;
      // clear width, more width, and search by
      let totalWidth = 0;
      const containerWidth = parentRef.current?.offsetWidth || 0;

      for (let index = 0; index < newData?.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0;
          totalWidth += 8;
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
            });
          } else {
            allItems?.push({
              ...newData[index],
              hidden: false,
            });
          }
        }
      }

      return allItems

    };


    const handleResize = () => {
      const items = calc();
      if (JSON.stringify(items) !== JSON.stringify(data)) {
        setData(items);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [par_items, parentRef?.current?.offsetWidth, drawerState])


  const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
  }, 300);  // 300ms delay
  

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResized = () => {
      
      // Clear any existing timeout to prevent multiple executions
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        updateCache()
      }, 1000);
    };

    window.addEventListener('resize', handleResized);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('resize', handleResized);
    };
  }, []);

  useEffect(() => {
    if(!isDropdownOpen) {
      setSearchValue('')
    }
  }, [isDropdownOpen])
  

  const lastShownItem = useMemo(() => {
    if (data?.length > 0) {
      const removeHidden = data.filter((item: any) => !item.hidden);
      const lastItem = removeHidden[removeHidden.length - 1];
      return lastItem;
    }
  }, [data]);

  const hasResult = useMemo(() => {
    if(data?.length) {
     return  Boolean(data?.filter((dta) => dta.hidden && (!!searchValue ? toLower(dta?.name)?.includes(toLower(searchValue)) : true ))?.length)
    } 
    return false
  }, [data, searchValue])

  return (
    <>
    
    </>
  );
};

export default InnerTabsContent;
