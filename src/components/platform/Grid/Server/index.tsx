import React from 'react'

import { GridScrollView } from '../common/GridScrollview'
import GridProvider from '../Provider'
import { type IPropsGrid } from '../types'

import { GridDesktop, GridMobile } from './views'

function MainServer({
  config,
  data,
  totalCount,
  sorting,
  defaultSorting,
  defaultAdvanceFilter,
  advanceFilter,
  pagination,
  parentType
}: IPropsGrid) {
  return (
    <GridProvider
      totalCount={totalCount}
      data={data}
      sorting={sorting}
      config={config}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter}
      advanceFilter={advanceFilter}
      pagination={pagination}
      parentType={parentType}
    >
      <GridScrollView className="hidden lg:block" parentType={parentType}>
      <GridDesktop parentType={parentType}/>
      </GridScrollView>
      <div className="my-0 lg:my-8 h-full md:my-8 md:mt-0 md:mb-12 lg:mb-0 lg:hidden">
        <GridMobile parentType={parentType}/>
      </div>
    </GridProvider>
  )
}

export default MainServer
