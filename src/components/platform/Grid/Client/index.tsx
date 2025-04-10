'use client'

import React from 'react'

import { Loader } from '~/components/ui/loader'
import { useSidebar } from '~/components/ui/sidebar'
import useWindowSize from '~/hooks/use-resize'
import { remToPx } from '~/utils/fetcher'

import ErrorPage from '../common/ErrorPage'
import GridProvider from '../Provider'
import { type IPropsGrid } from '../types'

import { GridDesktop, GridMobile } from './views'
import GridCardLists from './views/GridCardLists'
import GridMobileForm from './views/GridMobileForm'
import { cn } from '~/lib/utils'
import { useIsMobile } from '~/hooks/use-mobile'
import { Card } from '~/components/ui/card'
import GridCardView from '../Server/views/common/GridCardview'
import GridMobileRow from '../Server/views/common/GridMobileRow'
import GridCardViewClient from './views/common/GridCardViewClient'

interface IClientProps extends IPropsGrid {
  parentType?: 'grid' | 'form' | 'field' | 'grid_expansion'
  height?: string
  showPagination?: boolean
  hideSearch?: boolean
  showAction?: boolean
  parentProps?: {
    width?: string
    open?: boolean
    summary?: boolean
  }
  isLoading?: boolean
  gridLevel?: number
  isError?: boolean
  gridType?: 'card-list' | 'table'
  cardListOption?: {
    targetColumns: {
      label: string;
      headerCell: string;
      content: string;
    };
    excludedCols: string[];
  };
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
  gridLevel = 1,
  gridType = 'table',
  isError = false,
  parentExpanded,
  cardListOption,
  grouping,

}: IClientProps) {
  const { open } = useSidebar()
  const { width } = useWindowSize()
  const newWidth = width <= 0 ? 1920 : width
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6)
  const isMobile = useIsMobile()

  if (isLoading && !data?.length) {
    return (
      <div
        className="flex h-full items-center justify-center p-4"
        style={{ width: isMobile ? '100%' : gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <Loader
            className="bg-primary text-primary"
            label="Fetching data..."
            size="lg"
            variant='spinner'
          />
      </div>
    )
  }
  if (isError) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ width: gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <ErrorPage refetch={() => config?.onFetchRecords?.({})} />
      </div>
    )
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
      gridType={gridType}
      grouping={grouping}
    >
      {gridType === 'table'
        ? (

          
            <>
              <div className="hidden lg:grid">
                {
                  config?.viewMode === 'card' ? (
                    <GridCardViewClient   
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
                  ) : (
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
                  )
                }
               
              </div>
              <div className={cn(`flex  overflow-y-auto  py-1 lg:py-4 px-2 lg:hidden lg:h-[500px]`, `${gridLevel > 1  ? 'pr-0 lg:pr-2 pl-4 lg:pl-2' : 'h-[300px]'}`, `${parentType === 'form' ? 'h-[calc(100dvh-339px)]' : ''}`)}>
                {parentType === 'grid' || parentType === 'grid_expansion'
                  ? (
                      <GridMobile
                        hideSearch={hideSearch}
                        parentType={parentType}
                        shownPagination={showPagination ?? true}
                        gridLevel={gridLevel}
                      />
                    )
                  : (
                      <GridMobileForm
                        parentType={parentType}
                        shownPagination={showPagination ?? true}
                      />
                    )}
              </div>
            </>
          )
        : (
            <GridCardLists
              height={height}
              hideSearch={hideSearch}
              parentProps={parentProps}
              parentType={parentType}
              showAction={showAction}
              showPagination={showPagination ?? false}
              isLoading
              gridLevel={gridLevel}
              parentExpanded={parentExpanded}
              gridType={gridType}
              cardListOption={cardListOption}
            />
          )}
    </GridProvider>
  )
}

export default MainClient