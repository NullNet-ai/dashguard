'use client'

import React from 'react'

import { Card, CardFooter, CardHeader } from '~/components/ui/card'

import Header from '../Header'
import Pagination from '../Pagination'

import { cn } from '~/lib/utils'
import ScrollContainer from '../common/GridScrollContainer'
import GridDesktopContainer from '../common/GridDesktopContainer'
import { useGrid } from '../Provider'
import { useSidebar } from '~/components/ui/sidebar'
import { usePathname } from 'next/navigation';
interface IProps {
  gridKey?: string;
  parentType?: string;
  grid_tabs?: any[];
  isLoading?: boolean;
  withVerticalTabs?: boolean;
  gridChildClass?: string;
  gridDesktopClass?: string;
  sidebarTab?: {
    closed: boolean;
    useSidebar: boolean;
  };
}
function GridDesktop({ parentType, gridKey, grid_tabs, isLoading, withVerticalTabs, gridDesktopClass, gridChildClass, sidebarTab }: IProps) {
  const path =  usePathname()
  const [, , , path2] = path.split('/')
  const { state } = useGrid()
  const { open: sidebarOpen } = useSidebar();

  const { showPagination = true } = state?.config ?? {}
  
  const cardClass = withVerticalTabs ? sidebarOpen ? 'max-w-[calc(100vw-18rem)]' : 'max-w-[calc(100vw-7rem)]' : 'w-full'

  const wizardOpen = sidebarTab?.closed ? 'w-[calc(100vw-37.5em)]' : 'w-[calc(100vw-45.5em)]'
  const recordOpen = sidebarTab?.closed ? 'w-[calc(100vw-40.7em)]' : 'w-[calc(100vw-48.7em)]'
  const sidebarTransition = path2 !== 'grid' && sidebarTab?.useSidebar ? `transition-[width] duration-200 ease-in-out ${path2 === 'wizard' ? wizardOpen : recordOpen}` : '';

  return (
    <Card className={`col-span-full border-0 shadow-none ${gridDesktopClass} ${sidebarTransition}`}>
      <CardHeader>
        <Header gridKey={gridKey} grid_tabs={grid_tabs}/>
      </CardHeader>
      <ScrollContainer parentType={parentType} gridChildClass={gridChildClass}>
        <GridDesktopContainer isLoading={isLoading} parentType={parentType} />
        {/* <ScrollBar orientation="horizontal" /> */}
      </ScrollContainer>
      {
        showPagination && (
          <div className={cn(`sticky z-50`, `${parentType === 'record' ? 'bottom-[-34px]' : 'bottom-0'}`)}>
            <CardFooter>
              <Pagination />
            </CardFooter>
          </div>
        )
      }
    </Card>
  )
}

export default GridDesktop
