'use client'

import React from 'react';

import { GridDesktop, GridMobile } from './views';
import GridProvider from './Provider';
import { type IPropsGrid } from './types';
import { GridScrollView } from './common/GridScrollview';

function MainServer({
  config,
  data,
  totalCount,
  sorting,
  defaultSorting,
  defaultAdvanceFilter,
  advanceFilter,
  pagination,
  parentType = 'grid',
  grouping,
  gridKey,
  customCreateButton
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
      grouping={grouping}
      gridKey={gridKey}
      customCreateButton={customCreateButton}
    >
      <GridScrollView className="hidden lg:block">
        <GridDesktop parentType={parentType} gridKey={gridKey} />
      </GridScrollView>
      <div className="my-0 h-full md:my-8 md:mb-12 md:mt-0 lg:my-8 lg:mb-0 lg:hidden">
        <GridMobile />
      </div>
    </GridProvider>
  );
}

export default MainServer;
