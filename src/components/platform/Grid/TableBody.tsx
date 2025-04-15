import { flexRender, Row } from '@tanstack/react-table';
import React, { useContext } from 'react';

import { TableBody, TableCell, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import GridGroupingExpansion from './Client/views/GridGroupingExpansion';
import { getCommonPinningStyles } from './ColumnPining';
import { GridContext } from './Provider';
import { ScrollContainerContext } from './Server/views/common/GridScrollContainer';
import { type IExpandedRow } from './types';
import ArchiveConfirmationModal from './views/ArchiveConfirmationModal';
import BulkActionConfirmationModal from './views/common/BulkActionConfirmationModal';
import StatusCell from '~/components/ui/status-cell';

type MyTableBodyProps = {
  showAction?: boolean;
  gridLevel?: number;
  isLoading?: boolean;
  showPagination?: boolean;
  parentExpanded?: IExpandedRow[];
  reachEnd?: boolean;
};

export default function MyTableBody({
  showAction,
  gridLevel = 1,
  parentExpanded,
  reachEnd,
}: MyTableBodyProps) {
  const { state, actions } = useContext(GridContext);
  const context = useContext(ScrollContainerContext);
  const { isEndReached = false } = context ?? {};
  const expandedState = state?.table.getState().expanded as
    | Record<string, boolean>
    | undefined;

  const getExpandedRows = (
    rows: Row<any>[],
    expandedState: Record<string, boolean> | undefined,
    level: number,
  ) => {
    const expandedRows: IExpandedRow[] = [];

    rows.forEach((row) => {
      if (expandedState?.[row.id]) {
        expandedRows.push({ id: row.id, level });
      }
    });

    return expandedRows;
  };

  const expandedRows = getExpandedRows(
    state?.table.getExpandedRowModel().rows ?? [],
    expandedState,
    gridLevel,
  );
  const allExpandedRows = [...(parentExpanded ?? []), ...expandedRows];

  const visibleLeafColumns = state?.table.getVisibleLeafColumns();
  const visibleColumns = state?.initial_columns.filter((column) =>
    visibleLeafColumns?.some(
      (leafColumn) => leafColumn.columnDef.header === column.header,
    ),
  );

  return (
    <>
      <TableBody
        className="overflow-y-auto"
        data-test-id={testIDFormatter(`${state?.config.entity}-grd-tbl-tbody`)}
      >
        {state?.table.getRowModel().rows?.length ? (
          state?.table.getRowModel().rows.map((row, index) => (
            <>
              <TableRow
                className={cn(
                  `group relative border-b border-b-gray-100 hover:bg-border/50`,
                  `${row.getIsExpanded() ? 'border-l-2 border-l-primary' : ''}`,
                )}
                key={row.id + index}
                data-state={row.getIsSelected() && 'selected'}
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-tbl-tbody-row-${row.id + (index + 1)}`,
                )}
              >
                {row.getVisibleCells().map((cell, index) => {

                  if (
                    cell.column.id === 'action' &&
                    !row?.original?.is_group_by
                  ) {
                    return (
                      <td
                        key={cell.id + index}
                        className={cn(
                          'right-0',
                          isEndReached || reachEnd ? '' : 'sticky',
                        )}
                      >
                        <div className="px-3">
                          <div
                            className={cn(
                              'items-center',
                              `${showAction ? 'opacity-100' : 'opacity-0'}`,
                              !isEndReached && !reachEnd
                                ? 'group-hover:opacity-100'
                                : 'opacity-100',
                            )}
                          >
                            <div className="flex h-8 items-center justify-center gap-x-4 rounded-xl bg-background px-4 shadow-md">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  }
                  return (
                    <TableCell
                      className={cn(
                        'relative text-sm text-foreground',
                        !row.original.is_group_by ? 'hover:bg-border' : '',
                        getCommonPinningStyles(cell.column).className,
                      )}
                      key={cell.id + index}
                      row={cell?.row}
                      config={state?.config}
                      column_id={cell?.column?.id}
                      data-test-id={testIDFormatter(
                        `${state?.config.entity}-grd-tbl-tbody-row-cell-${cell.column.id + '-' + (index + 1)}`,
                      )}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        ...getCommonPinningStyles(cell.column).style,
                      }}
                    >
                      {cell.column.id === 'status'  ? (
                        <>
                        {/* get the string value of the cell */}
                        <StatusCell value={cell.getValue() as string}  renderType='value' />
                        </>
                      ) : (
                        <div className="flex flex-row flex-wrap gap-y-1">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      )}

                    
                      <div
                        {...{
                          className: !row.original.is_group_by
                            ? `absolute  border-l border-tertiary  top-[50%] translate-y-[-50%] right-0 cursor-col-resize w-px h-full bg-background  hover:bg-sky-700 hover:w-1 hover:h-10 hover:rounded-lg`
                            : '',
                          style: {},
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
              {row.getIsExpanded() &&
                (row.original.is_group_by ? (
                  <TableRow className="group relative border-b hover:bg-border/50">
                    <td
                      colSpan={state?.table.getVisibleLeafColumns().length}
                      className="relative bg-gray-50 lg:p-2 lg:px-4 lg:pb-2 lg:pl-12"
                    >
                      <GridGroupingExpansion
                        rowData={row.original}
                        config={state.config}
                        initialColumns={
                          state?.config?.group_by_initial_columns ||
                          state?.initial_columns
                        }
                        grouping={state.grouping?.slice(1)}
                        visibleColumns={visibleColumns ?? []}
                        parentGroupData={state?.config?.parentGroupData || []}
                        gridState={state}
                        parentGroupFields={state?.config?.parentGroupFields || state?.groupConfigs}
                      />
                    </td>
                  </TableRow>
                ) : (
                  <TableRow className="group relative border-b hover:bg-border/50">
                    <td
                      colSpan={state?.table.getVisibleLeafColumns().length}
                      className="relative bg-gray-50 lg:p-2 lg:px-4 lg:pb-2 lg:pl-12"
                    >
                      <div
                        style={{
                          height:
                            gridLevel === 2
                              ? 'calc(100% - 30px) '
                              : 'calc(100% - 85px)',
                        }}
                        className="absolute left-4 top-1 w-[1px] bg-primary"
                      >
                        <div className="absolute bottom-0 h-[1px] w-[20px] bg-primary">
                          <div className="absolute bottom-[-3px] right-[-2px] h-2 w-2 rounded-full bg-primary" />
                        </div>
                      </div>
                      <div>
                        {state?.config?.rowExpansionBuilder ? (
                          typeof state?.config?.rowExpansionBuilder ===
                          'function' ? (
                            state?.config?.rowExpansionBuilder({
                              rowData: row.original, 
                              viewMode: 'table',
                            })
                          ) : (
                            React.cloneElement(
                              state?.config?.rowExpansionBuilder,
                              {
                                rowData: row.original,
                                parentExpanded: allExpandedRows,
                                key: `expanded:${row.id ?? index}`,
                                grouping: state.grouping,
                                viewMode: 'table',
                              },
                            )
                          )
                        ) : (
                          <span>Provide your expand component</span>
                        )}
                      </div>
                    </td>
                  </TableRow>
                ))}
            </>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={state?.config?.columns.length}
              className="h-24 text-center text-foreground"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {state?.showArchiveConfirmationModal && (
        <ArchiveConfirmationModal
          open={state?.showArchiveConfirmationModal}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          setOpen={actions?.setShowArchiveConfirmationModal!}
          record={state?.rowToArchive}
          config={state?.config}
        />
      )}
      {state?.showBulkActionConfirmationModal && (
        <BulkActionConfirmationModal
          open={state?.showBulkActionConfirmationModal}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          onOpenChange={actions?.setShowBulkActionConfirmationModal!}
          action_type={state?.bulkActionType}
        />
      )}
    </>
  );
}
