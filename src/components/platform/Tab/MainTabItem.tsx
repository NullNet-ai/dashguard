import Cookies from 'js-cookie';
import { lowerCase, toLower } from 'lodash';
import { GripVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useMemo } from 'react';
import MainTabMenu from '~/components/application-layout/common/MainTabMenu';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { SortableDragHandleRawItem } from '~/components/ui/sortable';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  newItems: any
  index?: number
  className?: string
  isHidden?: boolean
  lastShownItem: any
  actions?: any
}

const MainTabitem = forwardRef<HTMLDivElement, InnerTabitemProps>(({
  tab,
  pathname,
  newItems,
  className,
  lastShownItem,
  isHidden,
  actions,
}, ref) => {
  const isGrid = tab.name === 'Dashboard' || tab.name === 'dashboard';
  const newPathname = usePathname()

  const [, , entityName, application, code] = (newPathname || '').split('/')
  const updateSubtabs = api.tab.updateSubTabs.useMutation()

  const isActive = useMemo(() => {
    if (isGrid && application === 'dashboard') {
      return true
    }

    return entityName === tab?.name
  }, [entityName, application])

  const getActiveName = () => {
    if (isGrid && application === 'dashboard') {
      return 'dashboard'
    }
    return code
  }

  const handleClickLink = () => {
    if (isHidden) {
      return
    }
    const getCurrent = getActiveName() || ''

    const cachedData = {
      tabs: newItems,
      lastShownItem: lastShownItem?.name,
      prevCurrent: getCurrent,
      key:  'main_tab_data' ,
    }
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`main_tab_data`]: cachedData,
    }))
  }

  useEffect(() => {
    void updateSubtabs.mutateAsync({
      current_context: '/portal/' + entityName,
      is_active: isActive,
      tab_name: tab.name,
    })
  }, [isActive])


  const tabNameRole = tab.name === 'user_role'? 'role' : tab.name.split(' ').join('-').toLowerCase()
  return (
    <div
      ref={ref}
      key={tabNameRole}
      className={cn(
        `${isActive ? 'border-b-0 border-l border-r border-t-2 border-t-primary rounded-t-md' : ''}`,
        `group relative group  whitespace-nowrap flex h-[30px] items-center md:h-[32px]`, `${lowerCase(tab?.name)==='dashboard' ? 'pl-[6px]' : 'pl-[3px]'} `, className,
      )}
    >
        {tab.name !== 'dashboard' ? <SortableDragHandleRawItem className='cursor-grab mr-1'>
          <GripVerticalIcon
            className="w-3.5 h-3.5 text-default-foreground/60"
            aria-hidden="true"
          />
        </SortableDragHandleRawItem> : null}
        <Link
          data-test-id={
            entityName + '-apptab-' + tabNameRole
          }
          onClick={() => {
            handleClickLink()
          }}
          href={isHidden ? `${newPathname}#` : tab.href}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive ? 'text-primary ' : 'text-default-foreground/60', 'whitespace-nowrap text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', `${isGrid ? 'px-[8px] pl-[0px]' : 'pr-0'}`, isHidden ? 'cursor-default' : '',
          )}
        >
          {formatTabName(tabNameRole)}
        </Link>
  
          {isActive ? <div className='absolute z-[1000] bottom-[-4px] h-1 left-0 w-full bg-white' /> : null }

      {(!isHidden && !isGrid) 
        ? (
            <MainTabMenu
              current={!!tab.href.match(pathname)}
              href={tab.href}
              tabs={newItems}
              name={tabNameRole}
              entity={entityName || ''}
              actions={actions}
              tab={tab}
            />
          )
        : (
            null
          )}
    </div>
  );
});

MainTabitem.displayName = 'MainTabitem';

export default MainTabitem;
