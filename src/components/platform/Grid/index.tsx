'use client';

import React from 'react';

import { GridDesktop, GridMobile } from './views';
import GridProvider from './Provider';
import { type IPropsGrid } from './types';
import { GridScrollView } from './common/GridScrollview';
import useScreenType from '~/hooks/use-screen-type';

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
  customCreateButton,
  customCreateActionButton,
  grid_tabs = [],
  isLoading,
  hideCreateNewFilter,
  defaultGrouping,
  current_tab_id,
  gridParentClass = '',
  gridRecordClass = '',
}: IPropsGrid) {
  const screenType = useScreenType();
  const isDesktop = screenType
    ? screenType === 'lg' || screenType === 'xl' || screenType === '2xl' || screenType === '4xl'
    : false;

  if (!grid_tabs.length) return null;

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
      customCreateActionButton={customCreateActionButton}
      hideCreateNewFilter={hideCreateNewFilter}
      defaultGrouping={defaultGrouping}
      current_tab_id={current_tab_id}
    >
      {isDesktop ? (
        <GridScrollView parentType={parentType} className={gridParentClass}>
          <GridDesktop
            isLoading={isLoading}
            parentType={parentType}
            gridKey={gridKey}
            grid_tabs={grid_tabs}
            gridRecordClass={gridRecordClass}
          />
        </GridScrollView>
      ) : (
        <div className="my-0 h-full md:my-8 md:mb-12 md:mt-0 lg:my-8 lg:mb-0">
          <GridMobile gridKey={gridKey} grid_tabs={grid_tabs} Loading={isLoading}/>
        </div>
      )}
    </GridProvider>
  );
}

export default MainServer;
