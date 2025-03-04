import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
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
}

const InnerTabitem = forwardRef<HTMLDivElement, InnerTabitemProps>(({
  tab,
  pathname,
  newItems,
  className,
  lastShownItem,
  isHidden,
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
        `group relative whitespace-nowrap flex h-[36px] items-center md:h-[32px]`, `${isGrid ? 'pl-0' : 'pl-[8px]'} `, className,
      )}
    >
      <Link
        data-test-id={
          entityName + '-apptab-' + tabNameRole
        }
        onClick={() => {
          if (isHidden) return
          Cookies.set('innerLastShownItem', lastShownItem?.name)
          Cookies.set('innerCopiedLastItems', JSON.stringify(newItems))
          const getCurrent = getActiveName() || ''
          Cookies.set('prevCurrent', getCurrent)
        }}
        href={isHidden ? `${newPathname}#` : tab.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          isActive ? 'text-primary' : 'text-default-foreground/60', 'whitespace-nowrap text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', `${isGrid ? 'px-[8px]' : 'pr-0'}`, isHidden ? 'cursor-default' : '',
        )}
      >
        {formatTabName(tabNameRole)}
        <span className="absolute right-0 h-[50%] w-[1px] bg-default/20" />
      </Link>
      {!isHidden
        ? (
            <TabMenu
              current={!!tab.href.match(pathname)}
              href={tab.href}
              tabs={newItems}
              name={tabNameRole}
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
