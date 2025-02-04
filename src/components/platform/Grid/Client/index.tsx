'use client'

import React from 'react'

import { Loader } from '~/components/ui/loader'
import { useSidebar } from '~/components/ui/sidebar'
import useWindowSize from '~/hooks/use-resize'
import { remToPx } from '~/utils/fetcher'

import GridProvider from '../Provider'
import { type IPropsGrid } from '../types'

import { GridDesktop, GridMobile } from './views'
import GridMobileForm from './views/GridMobileForm'

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
  showPagination = true,
  advanceFilter,
  sorting,
  showAction,
  parentProps,
  defaultSorting,
  defaultAdvanceFilter,
  pagination,
  isLoading,
  gridLevel,
}: IClientProps) {
  const { open } = useSidebar()
  const { width } = useWindowSize()
  const newWidth = width <= 0 ? 1920 : width
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6)

  if (isLoading) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ width: gridLevel && gridLevel > 2 ? '100%' : _width }}
      >
        <Loader
          size="md"
          label=""
          variant="circularShadow"
          className="bg-primary text-primary"
        />
      </div>
    )
  }

  return (
    <GridProvider
      totalCount={totalCount}
      onSelectRecords={onSelectRecords}
      advanceFilter={advanceFilter}
      data={data}
      config={config}
      initialSelectedRecords={initialSelectedRecords}
      parentType={parentType}
      sorting={sorting}
      defaultSorting={defaultSorting}
      defaultAdvanceFilter={defaultAdvanceFilter}
      pagination={pagination}
    >
      <div className="hidden lg:grid">
        <GridDesktop
          parentType={parentType}
          hideSearch={hideSearch}
          height={height}
          showAction={showAction}
          parentProps={parentProps}
        />
      </div>

      <div className="flex h-[300px] overflow-y-auto px-2 py-4 lg:hidden lg:h-[500px]">
        {parentType === 'grid'
          ? (
              <GridMobile
                shownPagination={showPagination}
                parentType={parentType}
              />
            )
          : (
              <GridMobileForm
                shownPagination={showPagination}
                parentType={parentType}
              />
            )}
      </div>
    </GridProvider>
  )
}

export default MainClient
