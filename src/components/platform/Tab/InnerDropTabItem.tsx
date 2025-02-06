import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import TabMenu from '~/components/application-layout/common/TabMenu';
import { cn, formatTabName } from '~/lib/utils';
import { api } from '~/trpc/react';

type InnerTabitemProps = {
  tab: any
  pathname?: string
  dropItems: any
  isActive: boolean
};

const InnerDropTabItem = ({
  tab,
  pathname,
  dropItems,
  isActive,
}: InnerTabitemProps) => {
  const updateSubtabs = api.tab.updateSubTabs.useMutation();
  const isGrid = tab.name === 'Grid' || tab.name === 'grid';
  const [, , entityName, application, code] = (pathname || '').split('/');
  const active = useMemo(() => {
    if (isGrid && application === 'grid') {
      return true;
    }

    return code === tab?.name;
  }, [code, application]);

  useEffect(() => {
    void updateSubtabs.mutateAsync({
      current_context: '/portal/' + entityName,
      is_active: active,
      tab_name: tab.name,
    });
  }, [active]);

  const checkIfUserRole = (entity: string) => entity === 'user_role' ? true : false;
  return (
    <>
      <Link
        data-test-id={
          'apptab-' + checkIfUserRole(tab.name)
            ? 'role'
            : tab.name.split(' ').join('-').toLowerCase()
        }
        href={tab.href + (tab.href.includes('?') ? '&' : '?') + 'dropdown=true'}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          isActive ? 'text-primary' : 'text-gray-500', 'whitespace-nowrap px-4 pr-1 text-sm font-medium', 'flex items-center space-x-2', 'hover:border-t-primary hover:text-primary',
        )}
      >
        {formatTabName(checkIfUserRole(tab.name) ? 'role' : tab.name)}
      </Link>
      <div className="absolute right-0 h-[50%] hidden w-[1px] bg-gray-300 dark:bg-gray-600" />
      <TabMenu
        current={!!tab.href.match(pathname)}
        href={tab.href}
        tabs={dropItems}
        name={checkIfUserRole(tab.name) ? 'role' : tab.name}
      />
    </>
  );
};

export default InnerDropTabItem;
