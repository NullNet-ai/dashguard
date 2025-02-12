import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  newItems: any
}

const InnerTabitem = ({
  tab,
  pathname,
  newItems,
}: InnerTabitemProps) => {
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
    updateSubtabs.mutateAsync({
      current_context: '/portal/' + entityName,
      is_active: isActive,
      tab_name: tab.name,
    })
  }, [isActive])

  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false
  return (
    <div
      key={checkIfUserRole(tab.name) ? 'role' : tab.name}
      className={cn(
        `group relative flex h-[36px] items-center md:h-[32px]`, `${isGrid ? 'pl-0' : 'pl-[8px]'} `,
      )}
    >
      <Link
        data-test-id={
          entityName + '-apptab-' + checkIfUserRole(tab.name)
            ? 'role'
            : tab.name.split(' ').join('-').toLowerCase()
        }
        onClick={() => {
          const getCurrent = getActiveName() || ''
          Cookies.set('prevCurrent', getCurrent)
        }}
        href={tab.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          isActive ? 'text-primary' : 'text-default-foreground/60', 'whitespace-nowrap text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary', `${isGrid ? 'px-[8px]' : 'pr-0'}`,
        )}
      >
        {formatTabName(checkIfUserRole(tab.name) ? 'role' : tab.name)}
        <span className="absolute right-0 h-[50%] w-[1px] bg-default/20" />
      </Link>
      <TabMenu
        current={!!tab.href.match(pathname)}
        href={tab.href}
        tabs={newItems}
        name={checkIfUserRole(tab.name) ? 'role' : tab.name}
      />
    </div>
  );
};

export default InnerTabitem
