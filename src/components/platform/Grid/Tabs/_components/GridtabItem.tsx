import Cookies from 'js-cookie';
import { lowerCase, toLower } from 'lodash';
import { GripVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { SortableDragHandleRawItem } from '~/components/ui/sortable';
import { cn, formatGridTabName } from '~/lib/utils';
import { api } from '~/trpc/react';
import GridMenu from '../GridMenu';
import GridMenuClient from '../GridMenuClient';
import { updateAllFilterdata } from '../SideDrawer/actions';
import { reorderGridTabActive } from '~/utils/sort-tab-items';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  newItems: any
  index?: number
  className?: string
  isHidden?: boolean
  onClickItem?: (tab?: any) => void
}

const GridTabItem = forwardRef<HTMLDivElement, InnerTabitemProps>(({
  tab,
  pathname,
  newItems,
  className,
  isHidden,
  onClickItem
}, ref) => {
  const isGrid = tab.name === 'Grid' || tab.name === 'grid';
  const newPathname = usePathname()


  const [, , entityName, application, code] = (newPathname || '').split('/')
  const updateSubtabs = api.tab.updateSubTabs.useMutation()

  const getActiveName = () => {
    if (isGrid && application === 'grid') {
      return 'grid'
    }
    return code
  }

  const handleClickLink = async (tabid?: string) => {

    const getCurrent = newItems?.find((item: any) => item.current)?.id;
    const newItem = [...newItems].map(item => {
      return { ...item, current: item.id === tab.id, is_current: item.id === tab.id}
    })

    const sorted = reorderGridTabActive(newItem, tabid ?? '', application ?? '')

    const removeHidden = sorted.filter((item: any) => !item.hidden);
    const lastItem = removeHidden[removeHidden.length - 1]

    const cachedData = {
      tabs: sorted,
      lastShownItem: lastItem?.name,
      lastShownItemID: lastItem?.id,
      prevCurrent: getCurrent,
      key:  'grid_tab_' + entityName,
    }

    try {
      await updateAllFilterdata(sorted)
    } catch (error) {
        console.error(error)
    }

    
    const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

    localStorage.setItem('cachedPortalItems', JSON.stringify({
      ...cachedItems,
      [`grid_tab_${entityName}`]: cachedData,
    }))

  }

  // const handleClickLink = (tab : any) => {
  //   if (isHidden) {
  //     return
  //   }

  //   const getCurrent = newItems?.find((item: any) => item.current)?.id;
  //   const cachedData = {
  //     tabs: [...newItems].map(item => {
  //           return { ...item, current: item.id === tab.id }
  //     }),
  //     lastShownItem: lastShownItem?.name,
  //     lastShownItemID: lastShownItem?.id,
  //     prevCurrent: getCurrent,
  //     key:  'grid_tab_' + entityName,
  //   }
  //   const cachedItems = JSON.parse(localStorage.getItem('cachedPortalItems') || '{}')

  //   localStorage.setItem('cachedPortalItems', JSON.stringify({
  //     ...cachedItems,
  //     [`grid_tab_${entityName}`]: cachedData,
  //   }))

  //   // Cookies.set('innerCopiedLastItems', JSON.stringify(newItems))
  //   // Cookies.set(`${entityName}-innerLastShownItem`, lastShownItem?.name)
  // }


  const tabNameRole = tab.name === 'user_role'? 'role' : tab.name.split(' ').join('-').toLowerCase()
  return (
    <div
      ref={ref}
      key={tabNameRole}
      className={cn(
        `group relative group bg-tertiary rounded-md whitespace-nowrap flex h-[36px] items-center md:h-[32px]`, `${isGrid ? 'pl-0' : 'pl-[8px]'} `, className,
      )}
    >
      {(!lowerCase(tab.name)?.includes('all') &&  !lowerCase(tab.name)?.includes(lowerCase(entityName || '')))  ? (
        <SortableDragHandleRawItem className='cursor-grab mr-1'>
          <GripVerticalIcon
            className="w-3.5 h-3.5 text-default-foreground/60"
            aria-hidden="true"
          />
        </SortableDragHandleRawItem>
      ) : null}
      
        <Link
          data-test-id={
            entityName + '-apptab-' + tabNameRole
          }
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation
            onClickItem?.(tab)
          }}
          href={isHidden ? `${newPathname}#` : tab.href}
          aria-current={tab.current ? 'page' : undefined}
          className={cn(
            tab.current ? 'text-primary ' : 'text-default/70', 'whitespace-nowrap text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', `${isGrid ? 'px-[8px] pr-0' : 'pr-0'}`, isHidden ? 'cursor-default' : '',
          )}
        >
          {formatGridTabName(tabNameRole)}
        </Link>
  
      {!isHidden
        ? (

            <GridMenuClient 
                tab={tab} 
                filter_id={tab?.id} 
                current={!!tab.href.match(pathname)}
                tabs={newItems}
                entity={entityName || ''}
            />
            // <TabMenu
            //   current={!!tab.href.match(pathname)}
            //   href={tab.href}
            //   tabs={newItems}
            //   name={tabNameRole}
            //   entity={entityName || ''}
            // />
          )
        : (
            null
          )}
    </div>
  );
});

GridTabItem.displayName = 'GridTabItem';

export default GridTabItem;
