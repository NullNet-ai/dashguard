import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import MainTabMenu from '~/components/application-layout/common/MainTabMenu';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';
import { updateAllMaindata } from './Actions/actions';

type MainDropdTabitemProps = {
  tab: any
  pathname?: string
  dropItems: any
  isActive: boolean
  onSelect?: () => void
  shownItems: any[]
  actions ?: any
  handleClickItem?: (item: any) => void
};

const MainDropTabItem = ({
  tab,
  pathname,
  dropItems,
  isActive,
  onSelect,
  shownItems,
  actions,
  handleClickItem
}: MainDropdTabitemProps) => {

  // const updateSubtabs = api.tab.updateSubTabs.useMutation();
  const isGrid = tab.name === 'Grid' || tab.name === 'grid';
  const newPathname = usePathname()
  const [, , entityName, application] = (pathname || '').split('/');
  const [, , , , code] = (newPathname || '').split('/')
  const active = useMemo(() => {
    if (isGrid && application === 'grid') {
      return true;
    }

    return code === tab?.name;
  }, [code, application]);

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


  // const handleClickLink = async (tabid?: string) => {
  //   const getCurrent = getActiveName() || ''
  //   const newItems = shownItems.map(item => {
  //     return {...item, current: item.name === tabid, is_current: item.name === tabid}
  //   })

    

  //   try {
  //     await updateAllMaindata(newItems)
  //   } catch (error) {
  //       console.error(error)
  //   }

  //   const cachedData = {
  //     tabs: newItems,
  //     lastShownItem: lastShownItem?.name,
  //     prevCurrent: getCurrent,
  //     key:  'main_tab_data',
  //   }
  //   const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

  //   localStorage.setItem('cachedPortalItems', JSON.stringify({
  //     ...cachedItems,
  //     [`main_tab_data`]: cachedData,
  //   }))

  //   // Cookies.set('innerCopiedLastItems', JSON.stringify(newItems))
  //   // Cookies.set(`${entityName}-innerLastShownItem`, lastShownItem?.name)
  // }

  // useEffect(() => {
  //   void updateSubtabs.mutateAsync({
  //     current_context: '/portal/' + entityName,
  //     is_active: active,
  //     tab_name: tab.name,
  //   })
  // }, [active]);

  const tabNameRole = tab.name === 'user_role' ? 'role' : tab.name.split(' ').join('-').toLowerCase();
  return (
    <>
      <div
        data-test-id={
          'apptab-' + tabNameRole
        }
        onClick={(e) => {
          // handleClickLink(tab.name)
            e.stopPropagation()
          handleClickItem?.(tab)
          onSelect?.()
        }}
        // href={tab.href + (tab.href.includes('?') ? '&' : '?') + 'dropdown=true'}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          isActive ? 'text-primary' : 'text-default/70', 'cursor-pointer whitespace-nowrap px-1 pr-1 text-sm font-medium', 'flex items-center space-x-2 flex-1', 'hover:border-t-primary hover:text-primary',
        )}
      >
        {formatTabName(tabNameRole)}
      </div>
      <div className="absolute right-0 h-[50%] hidden w-[1px] bg-gray-300 dark:bg-gray-600" />
      <MainTabMenu
        current={!!tab.href.match(pathname)}
        href={tab.href}
        tab={tab}
        tabs={dropItems}
        name={tabNameRole}
        entity={entityName ?? ''}
        actions={actions}
      />
    </>
  );
};

export default MainDropTabItem;
