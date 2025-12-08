'use client'

import React from 'react'

import { Card, CardFooter, CardHeader } from '~/components/ui/card'

import Header from '../Header'
import Pagination from '../Pagination'

import { cn } from '~/lib/utils'
import ScrollContainer from '../common/GridScrollContainer'
import GridDesktopContainer from '../common/GridDesktopContainer'
import { useGrid } from '../Provider'
interface IProps {
  gridKey?: string;
  parentType?: string;
  grid_tabs?: any[];
  isLoading?: boolean;
}
function GridDesktop({ parentType, gridKey, grid_tabs, isLoading }: IProps) {

  const { state } = useGrid()

  const { showPagination = true } = state?.config ?? {}

  return (
    <Card className="col-span-full border-0 shadow-none">
      <CardHeader>
        <Header gridKey={gridKey} grid_tabs={grid_tabs}/>
      </CardHeader>
      <ScrollContainer parentType={parentType}>
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
