'use client'

import Cookies from 'js-cookie';
import { toLower } from 'lodash';
import { GripVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { SortableDragHandleRawItem } from '~/components/ui/sortable';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';
import { updateAllMaindata, updateMainTabItem } from './Actions/actions';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  newItems: any
  index?: number
  className?: string
  isHidden?: boolean
  lastShownItem?: any
  handleClick?: (tab: any) => void
}

const InnerTabitem = forwardRef<HTMLDivElement, InnerTabitemProps>(({
  tab,
  pathname,
  newItems,
  className,
  lastShownItem,
  isHidden,
  handleClick
}, ref) => {
  const isGrid = tab.name === 'Grid' || tab.name === 'grid';
  const newPathname = usePathname()

  const [, , entityName, application, code] = (newPathname || '').split('/')
  const updateSubtabs = api.tab.updateSubTabs.useMutation()

  const isActive = useMemo(() => {
    if (isGrid && application === 'grid') {
      return true
    }

    return code === tab?.name
  }, [code, application])

  const getActiveName = () => {
    if (isGrid && application === 'grid') {
      return 'grid'
    }
    return code
  }

  const handleClickLink =  async (tab?: string) => {
    if (isHidden) {
      return
    }


    const getCurrent = getActiveName() || ''

    const cachedData = {
      tabs: newItems,
      lastShownItem: lastShownItem?.name,
      prevCurrent: getCurrent,
      key:  'inner_tab_data_' + entityName,
    }
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`inner_tab_data_${entityName}`]: cachedData,
    }))

    try {
      await updateMainTabItem(tab, entityName ?? '')
    } catch (error) {
        console.error(error)
    }

    //update maintab

    // Cookies.set('innerCopiedLastItems', JSON.stringify(newItems))
    // Cookies.set(`${entityName}-innerLastShownItem`, lastShownItem?.name)
  }

  useEffect(() => {
    void updateSubtabs.mutateAsync({
      current_context: '/portal/' + entityName,
      is_active: isActive,
      tab_name: tab.name,
    })
  }, [isActive])


  const tabNameRole =tab?.label ||  (tab.name === 'user_role'? 'role' : tab.name.split(' ').join('-').toLowerCase())
  return (
    <div
      ref={ref}
      key={tabNameRole}
      className={cn(
        `group relative group whitespace-nowrap flex h-[36px] items-center md:h-[32px]`, `${isGrid ? 'pl-0' : 'pl-[3px]'} `, className,
      )}
    >
      {toLower(formatTabName(tab.name)) !== 'grid' ? (
        <SortableDragHandleRawItem className='cursor-grab mr-1'>
          <GripVerticalIcon
            className="w-3.5 h-3.5 text-default-foreground/60"
            aria-hidden="true"
          />
        </SortableDragHandleRawItem>
      ) : null}
      
        <div
          data-test-id={
            entityName + '-apptab-' + tabNameRole
          }
          onClick={(e) => {
            e.stopPropagation()
            handleClick?.(tab)

          }}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive ? 'text-primary ' : 'text-default-foreground/60', 'cursor-pointer whitespace-nowrap text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', `${isGrid ? 'px-[8px]' : 'pr-0'}`, isHidden ? 'cursor-default' : '',
          )}
        >
          {formatTabName(tabNameRole)}
          <span className="absolute right-0 h-[50%] w-[1px] bg-default/20" />
        </div>
  
      {!isHidden && !isGrid
        ? (
            <TabMenu
              current={!!tab.href.match(pathname)}
              href={tab.href}
              tabs={newItems}
              name={tabNameRole}
              entity={entityName || ''}
            />
          )
        : (
            null
          )}
    </div>
  );
});

InnerTabitem.displayName = 'InnerTabitem';

export default InnerTabitem;
