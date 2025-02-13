'use client';

import React from 'react';

import { Loader } from '~/components/ui/loader';
import { useSidebar } from '~/components/ui/sidebar';
import useWindowSize from '~/hooks/use-resize';
import { remToPx } from '~/utils/fetcher';

import ErrorPage from '../common/ErrorPage';
import GridProvider from '../Provider';
import { type IPropsGrid } from '../types';

import { GridDesktop, GridMobile } from './views';
import GridMobileForm from './views/GridMobileForm';

interface IClientProps extends IPropsGrid {
  parentType?: 'grid' | 'form' | 'field' | 'grid_expansion';
  height?: string;
  showPagination?: boolean;
  hideSearch?: boolean;
  showAction?: boolean;
  parentProps?: {
    width?: string;
    open?: boolean;
    summary?: boolean;
  };
  isLoading?: boolean;
  gridLevel?: number;
  isError?: boolean;
}

function MainClient({
  config,
  data,
  parentType = 'grid',
  totalCount,
  onSelectRecords,
  initialSelectedRecords = {},
  height,
  hideSearch = true,
  showPagination,
  advanceFilter,
  sorting,
  showAction,
  parentProps,
  defaultSorting,
  defaultAdvanceFilter,
  pagination,
  isLoading,
  gridLevel,
  isError = false,
  parentExpanded
}: IClientProps) {
  const { open } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6);

  if (isLoading && !data?.length) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ width: gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <Loader
          className="bg-primary text-primary"
          label="Fetching data..."
          size="md"
          variant="circularShadow"
        />
      </div>
    );
  }
  if (isError) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ width: gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <ErrorPage refetch={() => config?.onFetchRecords?.({})} />
      </div>
    );
  }

  return (
    <GridProvider
      advanceFilter={advanceFilter}
      config={config}
      data={data}
      defaultAdvanceFilter={defaultAdvanceFilter}
      defaultSorting={defaultSorting}
      initialSelectedRecords={initialSelectedRecords}
      pagination={pagination}
      parentType={parentType}
      sorting={sorting}
      totalCount={totalCount}
      onSelectRecords={onSelectRecords}
      gridLevel={gridLevel}
    >
      <div className="hidden lg:grid">
        <GridDesktop
          height={height}
          hideSearch={hideSearch}
          parentProps={parentProps}
          parentType={parentType}
          showAction={showAction}
          showPagination={showPagination ?? false}
          isLoading
          gridLevel={gridLevel}
          parentExpanded={parentExpanded}
        />
      </div>

      <div className="flex h-[300px] overflow-y-auto px-2 py-4 lg:hidden lg:h-[500px]">
        {parentType === 'grid' ? (
          <GridMobile
            parentType={parentType}
            shownPagination={showPagination ?? true}
          />
        ) : (
          <GridMobileForm
            parentType={parentType}
            shownPagination={showPagination ?? true}
          />
        )}
      </div>
    </GridProvider>
  );
}

export default MainClient;
