'use client'

import React from 'react'

import { Card, CardFooter, CardHeader } from '~/components/ui/card'

import Header from '../Header'
import Pagination from '../Pagination'

import { cn } from '~/lib/utils'
import ScrollContainer from '../common/GridScrollContainer'
import GridDesktopContainer from '../common/GridDesktopContainer'
interface IProps {
  gridKey?: string;
  parentType?: string;
  grid_tabs?: any[];
}
function GridDesktop({ parentType, gridKey, grid_tabs }: IProps) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      <CardHeader>
        <Header gridKey={gridKey} grid_tabs={grid_tabs}/>
      </CardHeader>
      <ScrollContainer parentType={parentType}>
        <GridDesktopContainer parentType={parentType} />
        {/* <ScrollBar orientation="horizontal" /> */}
      </ScrollContainer>
      <div className={cn(`sticky `, `${parentType === 'record' ? 'bottom-[-25px]' : 'bottom-0'}`)}>
        <CardFooter>
          <Pagination />
        </CardFooter>
      </div>
    </Card>
  )
}

export default GridDesktop
