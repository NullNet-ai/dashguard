import React from 'react'

import { Card, CardFooter, CardHeader } from '~/components/ui/card'

import Header from '../../Header'
import Pagination from '../../Pagination'

import GridDesktopContainer from './common/GridDesktopContainer'
import ScrollContainer from './common/GridScrollContainer'
import { cn } from '~/lib/utils'

function GridDesktop({ parentType }: any) {
  return (
    <Card className="col-span-full border-0 shadow-none">
      <CardHeader>
        <Header />
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
