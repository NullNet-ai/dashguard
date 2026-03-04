'use client';

import { ChevronDownIcon } from 'lucide-react';
import { type ReactNode, useContext, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import useScreenType from '~/hooks/use-screen-type';
import { cn, formatTabName } from '~/lib/utils';
import { remToPx } from '~/utils/fetcher';
import Link from 'next/link';
import { CardComponent as Card } from '~/components/ui/card/index';
import { Button } from '~/components/ui/button';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import TimelineWizardRecord from '../TimelineRecord';
import { RecordContext } from '../Provider';
import { useSideDrawer } from '../../SideDrawer';

type TabItemProps = {
  tabs: any[];
  pathname: string;
  tab_items_left_slot?: ReactNode;
};

const SEARCH_BAR_WIDTH = 0;
let SUMMARY_TAB_WIDTH = 300;

const TabItems = ({ tabs, pathname, tab_items_left_slot }: TabItemProps) => {
  const winWidth = useWindowSize().width;
  const { open } = useSidebar();
  const { state } = useContext(RecordContext);
  const { enableTimeline, metadata } = state ?? {};
     const { actions: sideDrawerAction } = useSideDrawer();

  const handleOpenTimeline = () => {
    if (!enableTimeline) return;
    sideDrawerAction?.openSideDrawer({
      header: <h1 className='flex items-center gap-x-1'> <PresentationChartLineIcon className="size-5" /> <span>{metadata?.timeline_title ?? 'Timeline Records'} </span></h1>,
      sideDrawerWidth: '800px',
      body: {
        component: TimelineWizardRecord
      },
    });
  }


  let sidebar_width = remToPx(open ? 16 : 5);
  const size = useScreenType();
  const router = useRouter();
  const _Pathname = usePathname();
  const [, , , , , tabName] = _Pathname.split('/');
  const searchParams = useSearchParams();
  if (size === 'xs' || size === 'sm' || size === 'md') {
    sidebar_width = 0;
    SUMMARY_TAB_WIDTH = 0;
  }

  const newItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - SUMMARY_TAB_WIDTH;
    const showItem = max_width / 125;

    return tabs.slice(0, Math.floor(showItem));
  }, [tabs, winWidth, size, open]);

  const dropdownItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - SUMMARY_TAB_WIDTH;
    const showItem = max_width / 125;

    return tabs.slice(Math.floor(showItem));
  }, [newItems]);

  const entityName = pathname.split('/')[2];
  return (
    <Card>
      <div className="flex items-center">
        <div className="flex items-center flex-1 min-w-0">
          <div className={cn('flex flex-row flex-1 min-w-0')}>
            {newItems.map((tab, index: number) => {
              return (
                <div
                  key={tab.id}
                  className="group relative flex cursor-pointer items-center"
                >
                  <Link
                    href={`${tab.id}`}
                    data-test-id={
                      entityName +
                      '-rcrdtab-' +
                      tab.name.split(' ').join('-').toLowerCase()
                    }
                    key={tab.name + index}
                    // onClick={() => {
                    //   router.push(`?current_tab=${tab.id}`);
                    // }}
                    aria-current={tabName === tab.id ? 'page' : undefined}
                    className={cn(
                      tabName === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                      'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium md:py-3',
                      'flex items-center space-x-2',
                    )}
                  >
                    {formatTabName(tab.name)}
                  </Link>
                </div>
              );
            })}
          </div>
          {dropdownItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center space-x-1 bg-muted px-4 py-2 text-sm font-medium text-gray-500 hover:text-primary md:py-3"
                data-test-id={'rcrdtab-ddn-btn'}
              >
                <ChevronDownIcon
                  className="h-6 w-6 text-muted-foreground group-hover:text-primary"
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                {dropdownItems.map((tab) => (
                  <DropdownMenuItem
                    key={tab.name}
                    className="group relative flex items-center p-2 py-3"
                  >
                    <a
                      data-test-id={
                        entityName +
                        '-rcrdtab-' +
                        tab.name.split(' ').join('-').toLowerCase()
                      }
                      href={tab.href}
                      aria-current={
                        searchParams.get('current_tab') === tab.id
                          ? 'page'
                          : undefined
                      }
                      className={cn(
                        searchParams.get('current_tab') === tab.id
                          ? 'text-primary'
                          : 'text-gray-500',
                        'whitespace-nowrap px-4 text-sm font-medium',
                        'flex items-center space-x-2',
                        'hover:border-t-primary hover:text-primary',
                      )}
                    >
                      {formatTabName(tab.name)}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {tab_items_left_slot ? (
          <div className="flex items-center shrink-0 ml-2">
            {tab_items_left_slot}
          </div>
        ) : null}
        {/* <div className='border-r border-gray-200'>
              <Button
                variant={"outline"}
                className='flex gap-x-1 mr-2'
                type={"button"} 
                size={"xs"}
                onClick={() => {
                  handleOpenTimeline()
                }}
              >
                <PresentationChartLineIcon className='size-4 text-primary'/>
                <span className='text-primary'>Timeline Record</span>
              </Button>
        </div> */}
      </div>
    </Card>
  );
};

export default TabItems;
