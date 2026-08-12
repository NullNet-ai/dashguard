'use client';

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
import type { IArgs } from './InnerTabItems';

type InnerTabitemProps = {
  tab: any;
  pathname?: string;
  newItems: any;
  index?: number;
  className?: string;
  isHidden?: boolean;
  lastShownItem?: any;
  handleClick?: (tab: any) => void;
  tabsAction?: {
    handleCloseTab?: (args: IArgs) => void;
    handleCloseOtherTabs: ({ current, tab }: IArgs) => void;
    handleCloseAllTabs: () => void;
  };
};
const InnerTabitem = forwardRef<HTMLDivElement, InnerTabitemProps>(
  ({ tab, pathname, newItems, className, isHidden, tabsAction, handleClick }, ref) => {
    const isGrid = tab.name === 'Grid' || tab.name === 'grid';
    const newPathname = usePathname();
    const [, , entityName, application, code] = (newPathname || '').split('/');
    const updateSubtabs = api.tab.updateSubTabs.useMutation();

    const isActive = useMemo(() => {
      if (isGrid && application === 'grid') {
        return true;
      }
      return code === tab?.name;
    }, [isGrid, application, code, tab?.name]);

    useEffect(() => {
      void updateSubtabs.mutateAsync({
        current_context: '/portal/' + entityName,
        is_active: isActive,
        tab_name: tab.name,
      });
    }, [isActive]);

    const tabNameRole =
      tab?.label ||
      (tab.name === 'user_role'
        ? 'role'
        : tab.name.split(' ').join('-').toLowerCase());
    return (
      <div
        ref={ref}
        key={tabNameRole}
        className={cn(
          `group relative flex h-[36px] items-center whitespace-nowrap md:h-[32px]`,
          `${isGrid ? 'pl-0' : 'pl-[5px]'} `,
          className,
        )}
      >
        <div
          data-test-id={entityName + '-apptab-' + tabNameRole}
          // href={tab.href}
          onClick={e => {
            e.preventDefault()
            // handleClick?.(tab?.id)
          }}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            isActive ? 'text-primary' : 'text-default-foreground/60',
            'cursor-pointer whitespace-nowrap text-sm font-medium',
            'flex items-center space-x-2',
            'hover:border-t-primary hover:text-primary',
            `${isGrid ? 'px-[8px]' : 'pr-0'}`,
            isHidden ? 'cursor-default' : '',
          )}
        >
          {formatTabName(tabNameRole)}
          <span className="absolute right-0 h-[50%] w-[1px] bg-default/20" />
        </div>

        {!isHidden && !isGrid ? (
          <TabMenu
            current={tab?.current}
            href={tab.href}
            tab={tab}
            name={tab?.name}
            entity={entityName || ''}
            tabsAction={tabsAction}
          />
        ) : null}
      </div>
    );
  },
);

InnerTabitem.displayName = 'InnerTabitem';

export default InnerTabitem;
