'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/20/solid';
import { camelCase } from 'lodash';
import { useContext, useMemo, useState } from 'react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useSidebar } from '~/components/ui/sidebar';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { UpdateReportPagination } from './Action/UpdateReportPagination';
import { GridContext } from './Provider';
import { IPagination } from './types';
export default function Pagination({ width: customWidth }: { width?: string | number }) {
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

  const rowsPerPage = [10, 20, 30, 40, 50, 100];

  const handlePerPageValueChange = (value: string) => {
    setPagination({
      current_page: 1,
      limit_per_page: Number(value),
    })
    if (state?.parentType && state?.parentType == 'grid_expansion') {
      state?.config?.onFetchRecords?.({
        current: 1,
        limit: Number(value),
      });
      return;
    }
    UpdateReportPagination({
      current_page: 1,
      limit_per_page: Number(value),
    });
  };

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

  const generatePaginationText = (
    limit: number,
    pageNumber: number,
    totalCount: number,
  ): string => {
    const start = (pageNumber - 1) * limit + 1;
    const end = Math.min(pageNumber * limit, totalCount);

    return `Showing ${start} to ${end} of ${totalCount} results`;
  };

  const width = open
    ? ' md:w-[calc(100%-265px)] md:left-[258px]'
    : 'md:w-[calc(100%-70px)] md:left-[80px]';
  return (
    <div
      className={cn(
        'border-grid-header bg-grid-footer fixed bottom-14 flex w-full items-center justify-between bg-background px-4 py-2 transition-all duration-300 ease-in-out sm:px-4 sm:py-0 lg:static lg:w-full', width,
      )}
      style={{
        width: customWidth
          ? customWidth
          : undefined }}
    >
      <div className="flex w-full flex-1 justify-between sm:hidden">
        <a
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          data-test-id={testIDFormatter(
            `${state?.config.entity}-grd-pagination-page-prev-btn`,
          )}
          href={`?page=${Math.max(Number(currentPage) - 1 || 1)}&perPage=${rows}`}
        >
          Previous
        </a>
        <a
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          data-test-id={testIDFormatter(
            `${state?.config.entity}-grd-pagination-page-next-btn`,
          )}
          href={`?page=${Math.min(Number(currentPage) + 1, totalPages)}&perPage=${rows}`}
        >
          Next
        </a>
      </div>

      <div className="hidden flex-col gap-x-2 sm:flex sm:flex-1 sm:items-center sm:justify-between lg:flex-row">
        <div className="flex w-full flex-1 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {generatePaginationText(rows, currentPage, totalRows)}
            </span>
          </p>
          <div className="flex items-center justify-center gap-4">
            <Label className="whitespace-nowrap">Rows per page</Label>
            <Select
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
            </Select>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-10 lg:w-auto">
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-first-page-btn`,
              )}
              disabled={currentPage == 1}
              size="icon"
              variant="ghost"
              onClick={() => handlePaginationChange(1)}
            >
              <ChevronDoubleLeftIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-prev-page-btn`,
              )}
              disabled={currentPage == 1}
              size="icon"
              variant="ghost"
              onClick={() => handlePaginationChange(Math.max(Number(currentPage) - 1, 1))}
            >
              <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-page1-btn`,
              )}
              size="icon"
              variant={currentPage == 1 ? 'softPrimary' : 'ghost'}
              onClick={() => handlePaginationChange(1)}
            >
              1
            </Button>
            {totalPages > 1 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-page2-btn`,
                )}
                size="icon"
                variant={currentPage == 2 ? 'softPrimary' : 'ghost'}
                onClick={() => handlePaginationChange(2)}
              >
                2
              </Button>
            )}

            {totalPages > 3
              ? (
                  <span className="relative mt-1 inline-flex items-center px-4 text-sm font-semibold text-gray-700 focus:outline-offset-0">
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
                            <EllipsisHorizontalIcon className="h-5 w-5 rounded-full border" />
                          </MenuButton>
                        </div>
                      )}
                    </Menu>
                  </span>
                )
              : null}
            {totalPages > 2 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-last-page-btn`,
                )}
                size="icon"
                variant={currentPage == totalPages ? 'softPrimary' : 'ghost'}
                onClick={() => handlePaginationChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}

            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-next-btn`,
              )}
              disabled={currentPage == totalPages}
              size="icon"
              variant="ghost"
              onClick={() => handlePaginationChange(
                Math.min(Number(currentPage) + 1, totalPages),
              )}
            >
              <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
            </Button>

            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-last-btn`,
              )}
              disabled={currentPage == totalPages}
              size="icon"
              variant="ghost"
              onClick={() => handlePaginationChange(totalPages)}
            >
              <ChevronDoubleRightIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
