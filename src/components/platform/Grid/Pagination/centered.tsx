'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid';
import { camelCase } from 'lodash';
import { useContext, useMemo, useState } from 'react';

import { Button } from '~/components/ui/button';

import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { UpdateReportPagination } from '../Action/UpdateReportPagination';
import { GridContext } from '../Provider';
import { IPagination } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export default function PaginationCentered({ width: customWidth }: { width?: string | number }) {
  const { state } = useContext(GridContext);
  const { open } = useSidebar();
  const [pagination, setPagination] = useState<IPagination | undefined>(state?.pagination);

  const { currentPage, totalPages, rows, totalRows } = useMemo(() => {
    const { current_page = 1, limit_per_page = 100 } = pagination ?? {};
    const getTotalRows = state?.totalCount || 0;
    const getTotalPages = Math.ceil(getTotalRows / Number(limit_per_page));
    return {
      currentPage: current_page,
      totalPages: getTotalPages,
      rows: limit_per_page,
      totalRows: getTotalRows,
    };
  }, [pagination, state?.totalCount]);



  const handlePaginationChange = (page: number) => {
    setPagination({
      current_page: Number(page),
      limit_per_page: Number(rows),
    })
    if (state?.parentType && state?.parentType == 'grid_expansion') {
      state?.config?.onFetchRecords?.({
        current: Number(page),
        limit: Number(rows),
      });
      return;
    }
    UpdateReportPagination({
      current_page: Number(page),
      limit_per_page: Number(rows),
    });
  };

  const width = open
    ? ' md:w-[calc(100%-265px)] md:left-[258px]'
    : 'md:w-[calc(100%-70px)] md:left-[80px]';
  return (
    <div
      className={cn(
        'border-grid-header bg-grid-footer fixed bottom-14 flex flex-1 w-full items-center justify-between bg-background px-4 py-2 transition-all duration-300 ease-in-out sm:px-4 sm:py-0 lg:static lg:w-full', width,
      )}
      style={{
        width: customWidth
          ? customWidth
          : undefined }}
    >

          <nav
            aria-label="Pagination"
            className="isolate flex flex-1 w-full -space-x-px  justify-between  border-t-2"
          >
            <button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-prev-page-btn`,
              )}
              className={cn(
                'text-sm flex items-center gap-x-2 cursor-pointer',
                currentPage == 1 ? 'opacity-70 text-gray-400 cursor-not-allowed' : ''
              )}
              disabled={currentPage == 1}
              onClick={() => handlePaginationChange(Math.max(Number(currentPage) - 1, 1))}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Previous
            </button>
            
              <div className='flex items-center'> 
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-page1-btn`,
                )}
                size="icon"
                className={cn(` w-6 relative`, `${currentPage === 1 ? 'text-primary' : 'text-gray-500'}`)}
                variant='ghost'
                onClick={() => handlePaginationChange(1)}
              >
                {currentPage === 1 ? <span className='absolute w-full h-[2px] bg-primary top-[-2px]' /> : null}
                1
              </Button>
            {totalPages > 1 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-page2-btn`,
                )}
                size="icon"
                className={cn(` w-6 relative`, `${currentPage === 2 ? 'text-primary' : 'text-gray-500'} `)}
                variant='ghost'
                onClick={() => handlePaginationChange(2)}
              >
                  {currentPage === 2 ? <span className='absolute w-full h-[2px] bg-primary top-[-2px]' /> : null}
                2
              </Button>
            )}

            {totalPages > 3
              ? (
                  <span className="relative mt-1 inline-flex items-center  text-sm font-semibold text-gray-700 focus:outline-offset-0">
                    <Menu
                      as="div"
                      className="relative inline-block text-left"
                      data-test-id={camelCase(
                        `${state?.config.entity}PaginationPageMenu`,
                      )}
                    >
                      <MenuItems
                        className="absolute bottom-full left-0 z-10 mb-2 origin-bottom-left rounded-md bg-white p-2 shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        transition={true}
                      >
                        <div className="flex max-h-72 flex-col overflow-auto py-1">
                          {Array.from({ length: totalPages }, (_, index) => (
                            <MenuItem key={index + 1}>
                              <Button
                                data-test-id={testIDFormatter(
                                  `${state?.config.entity}-grd-pagination-page-menu-${index + 1}`,
                                )}
                                size="icon"
                                variant={
                                  currentPage == index + 1 ? 'softPrimary' : 'ghost'
                                }
                                onClick={() => handlePaginationChange(index + 1)}
                              >
                                {index + 1}
                              </Button>
                            </MenuItem>
                          ))}
                        </div>
                      </MenuItems>

                      {totalPages > 1 && (
                        <div>
                          <MenuButton
                            className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
                            data-test-id={testIDFormatter(
                              `${state?.config.entity}-grd-pagination-page-menu-trigger-horizontal`,
                            )}
                          >
                            <EllipsisHorizontalIcon className="h-4 w-4 relative bottom-[-4px]" />
                          </MenuButton>
                        </div>
                      )}
                    </Menu>
                  </span>
                )
              : null}
               {/* <Select
              defaultValue={`${rows}` || '10'}
              onValueChange={handlePerPageValueChange}
            >
              <SelectTrigger
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-row-per-page-sel-trigger`,
                )}
                className='text-xs'
              >
                <SelectValue placeholder={`${rows} rows`} className='text-xs' />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPage.map(row => (
                  <SelectItem
                    data-test-id={testIDFormatter(
                      `${state?.config.entity}-grd-pagination-row-per-page-sel-itm-${row}`,
                    )}
                    key={row}
                    value={row.toString()}
                  >
                    {row}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            {totalPages > 2 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-last-page-btn`,
                )}
                size="icon"
                variant='ghost'
                className={cn(` w-6 relative`, `${currentPage == totalPages ? 'text-primary' : 'text-gray-500'}`)}
                // variant={currentPage == totalPages ? 'softPrimary' : 'ghost'}
                onClick={() => handlePaginationChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}
              </div>
            <button
               data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-next-btn`,
              )}
              className={cn(
                'text-sm flex items-center gap-x-2 cursor-pointer',
                currentPage == totalPages ? 'opacity-70 text-gray-400 cursor-not-allowed' : ''
              )}
              disabled={currentPage == totalPages}
              onClick={() => handlePaginationChange(
                Math.min(Number(currentPage) + 1, totalPages),
              )}
            >
              Next <ArrowRight aria-hidden="true" className="h-4 w-4" /> 
            </button>
          </nav>

    </div>
  );
}
