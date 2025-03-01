import { EllipsisVertical } from 'lucide-react'
import React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

import { ArchiveComponent, DeleteComponent, EditComponent, RestoreComponent } from '../../../DefatultRow/Actions'

const GridCardViewContent = ({ row, rowIndex, state, statusCell, flexRender, parent, config, showArchiveConfirmationModal, setShowArchiveConfirmationModal, setRowToArchive, visibleCells }: any) => {
  const [showMore, setShowMore] = React.useState(false)
  return (
    <div
      className={cn(`flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 h-full`, `${!showMore ? 'max-h-[152px]' : ''}`)}
      data-state={row.getIsSelected() && 'selected'}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-item-${rowIndex + 1}`,
      )}
      key={row.id}
    >
      <div className={cn(`flex items-start justify-between gap-2 mb-2`)}>
        {statusCell
        && flexRender(statusCell.column.columnDef.cell, {
          ...statusCell.getContext(),
          view_mode: 'card',
        })}
        {parent === 'grid' || parent === 'form'
          ? (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild={true}>
                    <div className='flex cursor-pointer items-center gap-2 px-1 py-1.5 text-left text-sm'>
                      <EllipsisVertical
                        aria-hidden='true'
                        className='h-4 w-4 font-semibold text-foreground'
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    className='z-[100]'
                    side='right'
                  >
                    <EditComponent config={config!} row={row} viewMode='card' />
                    {!['Archived', 'Delete'].includes(row.original?.status) && (
                      <ArchiveComponent
                        config={config!}
                        open={showArchiveConfirmationModal}
                        record={row}
                        row={row}
                        setOpen={setShowArchiveConfirmationModal}
                        setRecord={setRowToArchive}
                        viewMode='card'
                      />
                    )}
                    {row.original?.status === 'Archived' && (
                      <>
                        <RestoreComponent
                          config={config!}
                          row={row}
                          viewMode='card'
                        />
                        <DeleteComponent
                          config={config!}
                          row={row}
                          viewMode='card'
                        />
                      </>
                    )}
                     {config?.customRowAction &&
                        config?.customRowAction({
                        row,
                        config,
                        viewMode: 'card',
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          : null}
      </div>

      <div className='grid grid-cols-2 gap-4 gap-y-2 text-sm'>
        {visibleCells.map((cell: any, cellIndex: any) => {
          // Skip id and status as they're already shown above
          if (
            cell.column.id === 'id'
            || cell.column.id === 'status'
            || cell.column.id === 'select'
            || cell.column.id === 'expand'
          ) return null

          if (!showMore && cellIndex >= 5) return null
          return (
            <div
              className='flex flex-row text-xs text-foreground'
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-crd-item-cell-${cell.column.id}-${cellIndex + 1}`,
              )}
              key={cell.id}
            >
              <div className='mr-2 text-slate-500'>
                {flexRender(
                  cell.column.columnDef.header, cell.getContext(),
                )}
              </div>
              <div
                className={cn(
                  'flex flex-wrap gap-y-1 gap-x-1', ['email', 'phone'].includes(cell.column.id)
                    ? 'break-all'
                    : 'break-normal',
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          )
        })}
      </div>
      {visibleCells?.length > 6 && (
        <button
            className='mt-2 text-sm text-primary'
            onClick={() => {
                setShowMore(!showMore)
            }}
            >
            {'Show '}
            {!showMore ? 'more' : 'less'}
        </button>
      )}
     
    </div>
  )
}

GridCardViewContent.displayName = 'GridCardViewContent'
export default GridCardViewContent
