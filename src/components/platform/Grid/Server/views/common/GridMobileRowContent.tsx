import { ChevronDown, ChevronUp, EllipsisVertical } from 'lucide-react'
import React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

import { ArchiveComponent, DeleteComponent, EditComponent, RestoreComponent } from '../../../DefatultRow/Actions'
import {Button as HeadlessBtn} from '@headlessui/react'

const GridMobileRowContent = ({ row, rowIndex, state, statusCell, flexRender, parent, config, showArchiveConfirmationModal, setShowArchiveConfirmationModal, setRowToArchive, visibleCells, gridLevel }: any) => {
  const [showMore, setShowMore] = React.useState(false)

  const hasExpandButton = visibleCells.some((cell: any) => cell.column.id === 'expand')

  return (
   <>
     <div
      className={cn(`flex flex-col justify-start rounded-md  p-4 relative`, `${hasExpandButton ? 'pl-8' : ''}`, `${gridLevel === 1 ? 'border border-b border-l-2 border-l-primary' : 'border border-b border-l-1 border-l-gray-300'}`)}
      data-state={row.getIsSelected() && 'selected'}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-item-${rowIndex + 1}`,
      )}
      key={row.id}
    >
      {hasExpandButton ?  <HeadlessBtn 
        onClick={() => {
          row.toggleExpanded()
        }}
        
      className={cn(`h-full left-0 absolute w-5  top-0 flex items-center justify-center`, `${row.getIsExpanded() ? 'bg-primary/15' : 'border-r border-gray-200'}`)}>
        {row.getIsExpanded() ?  <ChevronUp className='size-5 text-primary' /> : <ChevronDown className='size-5 text-default/40' />}
     </HeadlessBtn> : null}
     
      <div className={cn(`b-4 flex items-start justify-between gap-2`)}>
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
                    <div className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <EllipsisVertical
                        aria-hidden="true"
                        className="h-4 w-4 font-semibold text-foreground"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="z-[100]"
                    side="right"
                  >
                    <EditComponent config={config!} row={row} viewMode="card" />
                    {!['Archived', 'Delete'].includes(row.original?.status) && (
                      <ArchiveComponent
                        config={config!}
                        open={showArchiveConfirmationModal}
                        record={row}
                        row={row}
                        setOpen={setShowArchiveConfirmationModal}
                        setRecord={setRowToArchive}
                        viewMode="card"
                      />
                    )}
                    {row.original?.status === 'Archived' && (
                      <>
                        <RestoreComponent
                          config={config!}
                          row={row}
                          viewMode="card"
                        />
                        <DeleteComponent
                          config={config!}
                          row={row}
                          viewMode="card"
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

      <div className="grid grid-cols-1 gap-4 gap-y-2 text-sm">
        {visibleCells.map((cell: any, cellIndex: any) => {
          // Skip id and status as they're already shown above
          if (
            cell.column.id === 'id'
            || cell.column.id === 'status'
            || cell.column.id === 'select'
            || cell.column.id === 'expand'
          )
            return null

          if (!showMore && cellIndex >= 5) return null
          return (
            <div
              className="flex flex-row text-xs text-foreground"
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-crd-item-cell-${cell.column.id}-${cellIndex + 1}`,
              )}
              key={cell.id}
            >
              <div className="mr-2 text-slate-500">
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
      {visibleCells?.length > 5 && (
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
      {row.getIsExpanded()  ? (
        <div className='relative'>
          <div className={cn(`absolute left-1 w-[1px]  bg-primary/65`, `${gridLevel > 1 ? 'h-[50%]' : 'h-[90%]'} `)}>
            <div className='absolute w-2 h-[1px] bg-primary/65 left-0 bottom-0'>
              <div className='absolute w-[6px] h-[6px] rounded-full bg-primary right-[-3px] bottom-[-2px]' />
            </div>
          </div>
           {state?.config?.rowExpansionBuilder ? (
                    typeof state?.config?.rowExpansionBuilder ===
                    'function' ? (
                      state?.config?.rowExpansionBuilder({
                        rowData: row.original,
                      })
                    ) : (
                      React.cloneElement(
                        state?.config?.rowExpansionBuilder,
                        { rowData: row.original },
                      )
                    )
                  ) : (
                    <span>Provide your expand component</span>
                  )}
        </div>
      ) : null  }
   </>
  )
};

export default GridMobileRowContent;
