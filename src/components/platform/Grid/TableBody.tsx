import { flexRender, Row } from '@tanstack/react-table';
import React, { useContext } from 'react';

import { TableBody, TableCell, TableRow } from '~/components/ui/table';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import GridGroupingExpansion from './SubGrid/views/GridGroupingExpansion';
import { getCommonPinningStyles } from './ColumnPining';
import { GridContext } from './Provider';
import { type IExpandedRow } from './types';
import ArchiveConfirmationModal from './views/ArchiveConfirmationModal';
import BulkActionConfirmationModal from './views/common/BulkActionConfirmationModal';
import StatusCell from '~/components/ui/status-cell';
import { ScrollContainerContext } from './common/GridScrollContainer';
import { isEmpty } from 'lodash';
import DraggableRow from './common/DraggableRow';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type MyTableBodyProps = {
  showAction?: boolean;
  gridLevel?: number;
  isLoading?: boolean;
  showPagination?: boolean;
  parentExpanded?: IExpandedRow[];
  reachEnd?: boolean;
  parentMeta?: any
  parentType?: string
};

export default function MyTableBody({
  showAction,
  gridLevel = 1,
  parentExpanded,
  reachEnd,
  parentMeta,
  isLoading,
  parentType
}: MyTableBodyProps) {
  const { state, actions } = useContext(GridContext);
  const context = useContext(ScrollContainerContext);
  const { isEndReached = false, showCustomScroll = false } = context ?? {};
  const grouping = state?.table.getState().grouping ?? [];
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

  const getParentCellSize = (id: string) => {
    if (isEmpty(parentMeta)) return 0;
    const size = parentMeta?.find?.((cell: any) => cell.column.id === id)
    return size.column.getSize() ?? 0;
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

  const dataIds = state?.data.map((item: any) => item.id);

  const ContentLoading = () => {
    return (
      <div className="relative h-2 overflow-hidden">
        <div className="animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <TableBody
        className="overflow-y-auto"
        data-test-id={testIDFormatter(`${state?.config.entity}-grid-table-body`)}
      >
       
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={state?.config?.columns.length}
                className="p-0 text-center text-foreground"
              >
                <ContentLoading />
              </TableCell>
            </TableRow>
          ) : (
            state?.table.getRowModel().rows?.length ? (
                             <SortableContext
          items={dataIds}
          strategy={verticalListSortingStrategy}
        >


                {
                  state?.table.getRowModel().rows.map((row, index) => (
                <>

                  {
                    state?.config?.isDraggable ? (
                      <DraggableRow
                        row={row}
                        index={index}
                        showAction={showAction}
                        grouping={grouping}
                        parentType={parentType}
                        visibleColumns={visibleColumns}
                        allExpandedRows={allExpandedRows}
                        gridLevel={gridLevel}
                        data-test-id={testIDFormatter(`${state?.config.entity}-grid-table-body-row-${row.id + (index + 1)}`)}
                        getParentCellSize={getParentCellSize}
                        isEndReached={isEndReached}
                        reachEnd={reachEnd}
                        state={state}
                      />
                    ) :         <TableRow
                    className={cn(
                      `group relative border-b border-b-gray-100 hover:bg-border/50`,
                      `${row.getIsExpanded() ? 'border-l-2 border-l-primary' : ''}`,
                    )}
                    key={row.id + index}
                    data-state={row.getIsSelected() && 'selected'}
                    data-test-id={testIDFormatter(
                      `${state?.config.entity}-grid-table-body-row-${row.id + (index + 1)}`,
                    )}
                  >
                    {row.getVisibleCells().map((cell, index) => {

                      const parentCellSize = getParentCellSize(cell.column.id)

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
                                  'flex items-center',
                                  `${showAction ? 'opacity-100' : 'opacity-0'}`,
                                  showCustomScroll 
                                    ? (isEndReached || reachEnd ? 'opacity-100 justify-center' : 'opacity-0 justify-end group-hover:opacity-100')
                                    : 'opacity-100 justify-center'
                                )}
                              >
                                <div className="flex w-max h-8 items-center min-w-[60px] justify-center rounded-xl bg-background shadow-md overflow-hidden">
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
                            `${state?.config.entity}-grid-table-body-row-cell-${cell.column.id + '-' + (index + 1)}`,
                          )}
                          style={{
                            width: parentCellSize !== 0 ? parentCellSize - 25 : cell.column.getSize(),
                            minWidth: cell.column.columnDef.minSize,
                            ...getCommonPinningStyles(cell.column).style,
                          }}
                        >
                          {!row.original.is_group_by ? (
                            <>
                              {cell.column.id === 'status' ? (
                                <>
                                  {/* get the string value of the cell */}
                                  <StatusCell
                                    value={cell.getValue() as string}
                                    renderType="value"
                                  />
                                </>
                              ) : (
                                <div
                                  className="flex flex-row flex-wrap gap-y-1"
                                  data-test-id={cell.column.id === 'expand' && `${testIDFormatter(`${state?.config.entity}-grid-expanded`)}`}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {['grouping', 'select', 'expand'].includes(
                                cell.column.id,
                              ) && (
                                  <div className="flex flex-row flex-wrap gap-y-1">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </div>
                                )}
                            </>
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

                  }

          
                  {row.getIsExpanded() &&
                    (row.original.is_group_by ? (
                      // <TableRow className="group relative border-b hover:bg-border/50">
                      //   <td
                      //     colSpan={state?.table.getVisibleLeafColumns().length}
                      //     className={cn(`relative bg-gray-50`,
                      //       // `lg:p-2 lg:px-4 lg:pb-2 lg:pl-12`
                      //     )}
                      //   >
                      <GridGroupingExpansion
                        originalGroups={grouping}
                        rowIndex={index}
                        rowData={row.original}
                        config={state.config}
                        initialColumns={
                          state?.config?.group_by_initial_columns ||
                          state?.initial_columns
                        }
                        metadata={{
                          parentRow: row.getVisibleCells()
                        }}
                        parentType={parentType}
                        grouping={state.grouping?.slice(1)}
                        visibleColumns={visibleColumns ?? []}
                        parentGroupData={state?.config?.parentGroupData || []}
                        gridState={state}
                        parentGroupFields={
                          state?.config?.parentGroupFields ||
                          state?.groupConfigs
                        }
                        current_tab_id={state?.current_tab_id}
                      />
                      //   </td>
                      // </TableRow>
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
                                    state?.config?.rowExpansionBuilder as any,
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
                }

              </SortableContext>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={state?.config?.columns.length}
                  className="h-24 text-center text-foreground"
                >
                  {state?.config?.noResultText || 'No results.'}
                </TableCell>
              </TableRow>
            )
          )}



      </TableBody>
      {state?.showActionConfirmationModal && (
        <ArchiveConfirmationModal
          open={state?.showActionConfirmationModal}
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          setOpen={actions?.setShowActionConfirmationModal!}
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
