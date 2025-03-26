'use client';

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import { flexRender } from '@tanstack/react-table';
import { FilterIcon, X } from 'lucide-react';
import { useContext } from 'react';

import { TableHead, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { ColumnResizer } from './column-resizer';
import { getCommonPinningStyles } from './ColumnPining';
import HeaderMenu from './common/HeaderMenu';
import { GridContext } from './Provider';
import { Badge } from '~/components/ui/badge';
import { HeaderGroupWrapper } from './common/HeaderGroupWrapper';

export default function MyTableHead() {
  const { state } = useContext(GridContext);
  const grouping = state?.table.getState().grouping ?? [];
  return state?.table.getHeaderGroups().map((headerGroup, index) => (
    <TableRow
      className="backdrop-blur-lg"
      key={headerGroup.id + 'group' + index}
      data-test-id={testIDFormatter(`${state.config.entity}-grd-tbl-thead-row`)}
    >
      {headerGroup.headers.map((header, index) => {
        const columnSortKey = (header?.column?.columnDef as any)?.sortKey;
        const sortingKey = Array.isArray(columnSortKey)
          ? columnSortKey[0]
          : columnSortKey;
        const sortingState = state?.sorting?.find(
          (item) => item.id === header?.id || item.id === sortingKey,
        );
        const defaultFilter = state?.defaultAdvanceFilter?.filter(
          (filter) => filter.field === header.id,
        );

        const cellValue = header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext());
        return (
          <TableHead
            key={header.id + index}
            data-test-id={testIDFormatter(
              `${state.config.entity}-grd-tbl-thead-row-${header.column.id}`,
            )}
            className={cn(
              'group relative font-medium text-muted-foreground',
              getCommonPinningStyles(header?.column).className,
              // @ts-expect-error error
              header.column.columnDef.meta?.className,
            )}
            style={{
              width: header.getSize(),
              ...getCommonPinningStyles(header?.column).style,
            }}
          >
            <div
              className={cn(
                'flex flex-row items-center',
                header.column.id === 'action'
                  ? 'justify-center'
                  : 'justify-between',
                'group relative font-medium text-muted-foreground', // originally bg-grid-header
                getCommonPinningStyles(header?.column).className,
                // @ts-expect-error - TS doesn't know about meta
                header.column.columnDef.meta?.className,
              )}
            >
              <div className="flex flex-row items-center gap-1 whitespace-nowrap text-default">
                {cellValue}
                {sortingState && !sortingState.desc && (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
                {sortingState && sortingState.desc && (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {!!defaultFilter?.length && (
                  <FilterIcon className="h-3 w-3 text-primary" />
                )}
                {/* <div className="flex flex-wrap gap-2"> */}
                {header.id === 'grouping' && <HeaderGroupWrapper items={grouping} state={state}/> }
                  
                {/* </div> */}
              </div>
              <HeaderMenu header={header} defaultFilter={defaultFilter} />
            </div>
            <ColumnResizer header={header} />
          </TableHead>
        );
      })}
    </TableRow>
  ));
}
