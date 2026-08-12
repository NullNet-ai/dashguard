'use client'

import { useSortable } from '@dnd-kit/sortable'
import { flexRender, Row } from '@tanstack/react-table'
import React, { CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { TableCell, TableRow } from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'
import { getCommonPinningStyles } from '../ColumnPining'
import StatusCell from '~/components/ui/status-cell'

interface DraggableRowProps {
    row: Row<any>,
    index: number, state: any,
    getParentCellSize: any,
    isEndReached?: boolean,
    reachEnd?: boolean,
    showAction?: boolean,
    grouping?: any,
    parentType?: string,
    visibleColumns?: any,
    allExpandedRows?: any,
    gridLevel?: number,
}
// Row Component
const DraggableRow = ({ 
    row,
    index,
    state,
    getParentCellSize,
    isEndReached,
    reachEnd,
    showAction, 
    grouping,
    parentType, 
    visibleColumns, 
    allExpandedRows,
    gridLevel = 1,
    }: DraggableRowProps) => {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform), //let dnd-kit do its thing
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    }
    return <>
        <tr
            ref={setNodeRef}
            className={cn(
                `group relative aaa border-b border-b-gray-100 hover:bg-border/50`,
                `${row.getIsExpanded() ? 'border-l-2 border-l-primary' : ''}`,
            )}
            key={row.id + index}
            data-state={row.getIsSelected() && 'selected'}
            data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-tbl-tbody-row-${row.id + (index + 1)}`,
            )}
            style={style}
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
                                        'items-center',
                                        `${showAction ? 'opacity-100' : 'opacity-0'}`,
                                        !isEndReached && !reachEnd
                                            ? 'group-hover:opacity-100'
                                            : 'opacity-100',
                                    )}
                                >
                                    <div className="flex h-8 items-center justify-center rounded-xl bg-background shadow-md overflow-hidden">
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
                                        data-test-id={cell.column.id === 'expand' && `${testIDFormatter(`${state?.config.entity}-grd-expd`)}`}
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
        </tr>
    </>

}

export default DraggableRow;