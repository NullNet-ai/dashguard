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
  dropItems: any
  isActive: boolean
  onSelect?: () => void
  shownItems: any[]
};

const InnerDropTabItem = ({
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

  useEffect(() => {
    void updateSubtabs.mutateAsync({
      current_context: '/portal/' + entityName,
      is_active: active,
      tab_name: tab.name,
    })
  }, [active]);

  const tabNameRole = tab.name === 'user_role' ? 'role' : tab.name.split(' ').join('-').toLowerCase();
  return (
    <>
      <Link
        data-test-id={
          'apptab-' + tabNameRole
        }
        onClick={() => {
          const getCurrent = getActiveName() || ''
          Cookies.set('prevCurrent', getCurrent)
          Cookies.set('innerCopiedLastItems', JSON.stringify(shownItems))
          Cookies.set('innerLastShownItem', lastShownItem?.name)
          onSelect?.()
        }}
        href={tab.href + (tab.href.includes('?') ? '&' : '?') + 'dropdown=true'}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          isActive ? 'text-primary' : 'text-gray-500', 'whitespace-nowrap px-4 pr-1 text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary',
        )}
      >
        {formatTabName(tabNameRole)}
      </Link>
      <div className="absolute right-0 h-[50%] hidden w-[1px] bg-gray-300 dark:bg-gray-600" />
      <TabMenu
        current={!!tab.href.match(pathname)}
        href={tab.href}
        tabs={dropItems}
        name={tabNameRole}
      />
    </>
  );
};

export default InnerDropTabItem;
