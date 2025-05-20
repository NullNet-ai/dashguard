'use client';

import { lowerCase } from 'lodash';
import { EllipsisVertical, FileX, FileX2, StarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  closeAllInnerClassTabs,
  closeInnerClassTab,
  closeOtherInnerClassTabs,
} from '~/components/platform/Tab/Actions/InnerTabActions';
import { IArgs } from '~/components/platform/Tab/InnerTabItems';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { testIDFormatter } from '~/utils/formatter';

const TabMenu = ({
  current,
  href,
  tabs,
  name,
  entity,
  tabsAction,
}: {
  current: boolean;
  href: string;
  tabs: any;
  name: string;
  entity: string;
  tabsAction?: {
    handleCloseTab?: (args: IArgs) => void;
    handleCloseOtherTabs: ({ pathname, current, tabs }: IArgs) => void;
    handleCloseAllTabs: () => void;
  };
}) => {
  const router = useRouter();
  if (name === 'Grid') return null;
  return (
    <DropdownMenu data-test-id={testIDFormatter(`${entity}-tab-menu`)}>
      <DropdownMenuTrigger asChild>
        <div
          className="opacity-1 flex cursor-pointer items-center gap-2 py-1.5 pr-[2px] text-left text-sm group-hover:opacity-100 lg:opacity-0"
          data-test-id={testIDFormatter(`${entity}-tab-menu-trigger`)}
        >
          <EllipsisVertical
            className="h-3.5 w-3.5 cursor-pointer font-semibold text-default/60"
            aria-hidden="true"
            data-test-id={testIDFormatter(`${entity}-tab-menu-trigger-icon`)}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        data-test-id={testIDFormatter(`${entity}-tab-menu-content`)}
      >
        <DropdownMenuItem
          className="relative flex cursor-pointer gap-2"
          onSelect={async (event) => {
            event.preventDefault();
            tabsAction?.handleCloseTab?.({
              pathname: href,
              current,
              tabs,
            });
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-tab`)}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer gap-2"
          onSelect={async (event) => {
            event.preventDefault();
            tabsAction?.handleCloseOtherTabs({
              pathname: href,
              current,
              tabs,
            });
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-other-tabs`)}
        >
          <FileX2 className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer gap-2"
          onSelect={async (event) => {
            event.preventDefault();
            tabsAction?.handleCloseAllTabs();
          }}
          data-test-id={testIDFormatter(`${entity}-tab-menu-close-all-tabs`)}
        >
          <FileX className="h-4 w-4 text-default/60" aria-hidden="true" />
          <span>Close All Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator
          data-test-id={testIDFormatter(`${entity}-tab-menu-separator`)}
        />
        <DropdownMenuItem
          className="flex gap-2"
          data-test-id={testIDFormatter(`${entity}-tab-menu-add-favorites`)}
        >
          <StarIcon className="h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TabMenu;
