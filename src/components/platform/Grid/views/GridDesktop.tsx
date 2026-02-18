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
interface IProps {
  gridKey?: string;
  parentType?: string;
  grid_tabs?: any[];
  isLoading?: boolean;
  gridRecordClass?: string;
  withVerticalTabs?: boolean;
}
function GridDesktop({ parentType, gridKey, grid_tabs, isLoading, gridRecordClass, withVerticalTabs }: IProps) {

  const { state } = useGrid()
  const { open: sidebarOpen } = useSidebar();

  const { showPagination = true } = state?.config ?? {}
  
  const cardClass = withVerticalTabs ? sidebarOpen ? 'max-w-[calc(100vw-18rem)]' : 'max-w-[calc(100vw-7rem)]' : 'w-full'

  return (
    <Card className={cn('col-span-full border-0 shadow-none', cardClass)}>
      <CardHeader>
        <Header gridKey={gridKey} grid_tabs={grid_tabs}/>
      </CardHeader>
      <ScrollContainer parentType={parentType} gridRecordClass={gridRecordClass}>
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
