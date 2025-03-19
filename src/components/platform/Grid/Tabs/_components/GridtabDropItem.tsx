import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';
import GridMenuDropClient from './GridMenuDropClient';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  dropItems: any
  isActive: boolean
  onSelect?: () => void
  shownItems: any[]
};

const GridtabDropItem = ({
  tab,
  pathname,
  dropItems,
  isActive,
  onSelect,
  shownItems,
}: InnerTabitemProps) => {
  const updateSubtabs = api.tab.updateSubTabs.useMutation();
  const isGrid = tab.name === 'Grid' || tab.name === 'grid';
  const newPathname = usePathname()
  const [, , entityName, application] = (pathname || '').split('/');
  const [, , , , code] = (newPathname || '').split('/')


  const getActiveName = () => {
    if (isGrid && application === 'grid') {
      return 'grid'
    }
    return code
  }

  const lastShownItem = useMemo(() => {
    if (shownItems?.length > 0) {
      const removeHidden = shownItems.filter((item: any) => !item.hidden);
      const lastItem = removeHidden[removeHidden.length - 1]
      return lastItem
    }
  }, [shownItems]);


  const handleClickLink = () => {

    const getCurrent = getActiveName() || ''
    const cachedData = {
      tabs: [...shownItems].map(item => {
            return { ...item, current: item.id === tab.id }
      }),
      lastShownItem: lastShownItem?.name,
      prevCurrent: getCurrent,
      key:  'grid_tab_' + entityName,
    }
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`grid_tab_${entityName}`]: cachedData,
    }))

  }


  const tabNameRole = tab.name === 'user_role' ? 'role' : tab.name.split(' ').join('-').toLowerCase();
  return (
    <>
      <Link
        data-test-id={
          'apptab-' + tabNameRole
        }
        onClick={() => {
          handleClickLink()
          onSelect?.()
        }}
        href={tab.href + (tab.href.includes('?') ? '&' : '?') + 'dropdown=true'}
        aria-current={tab?.current ? 'page' : undefined}
        className={cn(
          tab?.current ? 'text-primary' : 'text-default/70', 'whitespace-nowrap px-1 pr-1 text-sm font-medium', 'flex items-center space-x-2 flex-1', 'hover:border-t-primary hover:text-primary',
        )}
      >
        {formatTabName(tabNameRole)}
      </Link>
      <div className="absolute right-0 h-[50%] hidden w-[1px] bg-gray-300 dark:bg-gray-600" />
      <GridMenuDropClient 
          tab={tab} 
          filter_id={tab?.id} 
          current={!!tab.href.match(pathname)}
          tabs={shownItems}
          entity={entityName || ''}
          />
    </>
  );
};

export default GridtabDropItem;
