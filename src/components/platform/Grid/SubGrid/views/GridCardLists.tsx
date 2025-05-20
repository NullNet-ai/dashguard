'use client'

import { useContext, useMemo } from 'react'

import { GridContext } from '../../Provider'
import Search from '../../Search'
import GridClientTabs from '../components/GridClientTabs'

import GridCardListItem from './GridCardListItem'
import Pagination from '../../Pagination'
import { useSidebar } from '~/components/ui/sidebar'
import useWindowSize from '~/hooks/use-resize'
import { remToPx } from '~/utils/fetcher'
import { cn } from '~/lib/utils'
import Sorting from '../../Sorting'

const GridCardLists = ({ hideSearch, parentType, gridType, cardListOption, showPagination, parentProps, gridLevel }: any) => {

  const { state, actions } = useContext(GridContext);
  const { open: sidebarOpen } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = sidebarOpen ? newWidth - remToPx(17) : newWidth - remToPx(6);

  const { open, summary, metadata } = parentProps || {};


  const conWidth = useMemo(() => {
    if (open && summary) {
      return 'lg:w-[calc(100vw-578px)]';
    } else if (!open && summary) {
      return 'w-auto';
    } else if (open && !summary) {
      return 'w-[calc(100vw-320px)]';
    } else return '';
  }, [open, summary]);

  const isExpandedTable = parentType === 'grid_expansion';

  const expandedWidth = useMemo(() => {
    if (isExpandedTable) {
      return _width - 90 - (gridLevel === 3 ? 100 : 0);
    } else {
      return undefined;
    }
  }, [isExpandedTable]);

  return (
    <>
      <div className='flex flex-col lg:flex-row justify-between gap-y-2 lg:gap-y-0'>
        <div className='lg:w-[40%] w-full h-[36px] mb-6 lg:mb-0'>
          <GridClientTabs />
          <Sorting />
        </div>
        {!hideSearch && <Search parentType={parentType} creatable={false} switchable={false} gridType={gridType} />}
      </div>
      <div className={cn(`flex flex-col gap-y-2  overflow-y-auto`,
        `${parentType === 'record' ? '' : ''}`,
        metadata?.gridListClass ? metadata?.gridListClass : 'lg:h-[calc(100vh-350px)]',
      )}>
        {state?.table.getRowModel().rows?.length
          ? state?.table.getRowModel().rows.map((row) => {
            return <GridCardListItem row={row} key={row.id} options={cardListOption}/>
          })
          : (
              <div className="h-24 border rounded-md text-center text-foreground text-sm flex items-center justify-center mt-4">
                No results.
              </div>
            )}
      </div>
      {parentType === 'grid' || showPagination ? (
          <div className='py-2'>
             <Pagination width={expandedWidth} />
          </div>
        ) : null}
    </>
  )
};

export default GridCardLists
