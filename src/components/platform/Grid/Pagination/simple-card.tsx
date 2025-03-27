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

import { UpdateReportPagination } from '../Action/UpdateReportPagination';
import { GridContext } from '../Provider';
import { IPagination } from '../types';
export default function PaginationSimpleCard({ width: customWidth }: { width?: string | number }) {
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
        'border-grid-header  bg-grid-footer fixed bottom-14 flex w-full items-center justify-between bg-background px-4 py-2 transition-all duration-300 ease-in-out sm:px-2 sm:py-0 lg:static lg:w-full', width,
      )}
      style={{
        width: customWidth
          ? customWidth
          : undefined }}
    >
      <div className="hidden border flex-col gap-x-2 sm:flex sm:flex-1 sm:items-center sm:justify-between lg:flex-row px-4 py-2">
        <div className="flex w-full flex-1 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {generatePaginationText(rows, currentPage, totalRows)}
            </span>
          </p>

        </div>

        <div className="flex w-full items-center justify-between gap-10 lg:w-auto">
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md gap-x-4"
          >

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
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-prev-page-btn`,
              )}
              disabled={currentPage == 1}
              variant="outline"
              onClick={() => handlePaginationChange(Math.max(Number(currentPage) - 1, 1))}
            >
             Previous
            </Button>

     
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-next-btn`,
              )}
              disabled={currentPage == totalPages}
              variant="outline"
              onClick={() => handlePaginationChange(
                Math.min(Number(currentPage) + 1, totalPages),
              )}
            >
             Next
            </Button>

          </nav>
        </div>
      </div>
    </div>
  );
}
