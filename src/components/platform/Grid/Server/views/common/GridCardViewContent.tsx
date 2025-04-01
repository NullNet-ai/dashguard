import { ChevronDown, ChevronRight, EllipsisVertical } from 'lucide-react'
import React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'
import {Button as HeadlessBtn} from '@headlessui/react'
import { ArchiveComponent, DeleteComponent, EditComponent, RestoreComponent } from '../../../DefatultRow/Actions'
import StatusCell from '~/components/ui/status-cell'

const GridCardViewContent = ({ 
    row, 
    rowIndex, 
    state, 
    statusCell, 
    flexRender, 
    parent, 
    config, 
    showArchiveConfirmationModal, 
    setShowArchiveConfirmationModal, 
    setRowToArchive, 
    visibleCells, 
    codecell, 
    categoryCell, 
    statColumn,
    gridLevel= 1,
    selectedDefaultCells = [] }: any) => {
  const [showMore, setShowMore] = React.useState(false)

  const hasExpandButton = visibleCells.some((cell: any) => cell.column.id === 'expand')
  
  

  return (
    <>
      <div
      className={cn(`flex flex-col relative justify-start rounded-md border border-b border-l-2 border-l-primary p-4 h-full`, `${!showMore ? 'max-h-[152px]' : ''}`)}
      data-state={row.getIsSelected() && 'selected'}
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-crd-item-${rowIndex + 1}`,
      )}
      key={row.id}
    >
{true ?  <HeadlessBtn 
        onClick={() => {
          row.toggleExpanded()
        }}
        
      className={cn(`h-full left-0 absolute w-5  top-0 flex items-center justify-center`, `${row.getIsExpanded() ? 'bg-primary/15' : 'border-r border-gray-200'}`)}>
        {row.getIsExpanded() ?  <ChevronDown className='size-5 text-primary' /> : <ChevronRight className='size-5 text-default/40' />}
     </HeadlessBtn> : 'wa;a'}

      <div className={cn(`flex items-start justify-between gap-2 mb-2`)}>

        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                {statusCell
                  && 
                  <StatusCell 
                    value={statusCell.getValue() as string}
                    renderType='rounded'
                  />  
                }
                {codecell ?   (
                  <span className='text-sm font-semibold'>
                    {
                      flexRender(codecell.column.columnDef.cell, {
                        ...codecell.getContext(),
                        view_mode: 'card',
                      })
                    }
                  </span>
                ) : null }
              </div>

          </div>
              
          {categoryCell ?  <div className='flex mt-2'>
              <div className='flex gap-x-1 flex-wrap'>
              {flexRender(categoryCell.column.columnDef.cell, {
                ...categoryCell.getContext(),
                view_mode: 'card',
              }) }
              </div>
            </div> : null}

       
          
        </div>
     
     
        {parent === 'grid' || parent === 'form'
          ? (
              <div className='flex items-center'>
                {statColumn ? flexRender(statColumn.column.columnDef.cell, {
                ...statColumn.getContext(),
                view_mode: 'card',
              }) : null}
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
              </div>
            )
          : null}

        
      </div>


      {selectedDefaultCells?.length ? (
              <div className='flex gap-x-1 flex-wrap flex-col'>
              {selectedDefaultCells?.map((cell: any) => {
                 return <div key={cell.column.id} className='flex justify-between text-sm'>
                    <span className='mr-2 text-slate-500 text-xs'>
                      {flexRender(
                        cell.column.columnDef.header, cell.getContext(),
                      )}
                    </span>
                   <span className='flex-1 text-right '>
                    {
                        flexRender(cell.column.columnDef.cell, {
                          ...cell.getContext(),
                          view_mode: 'card',
                        }) 
                      }
                   </span>
                 </div>
              })}
              </div>
          ) : null
          }
      
      {/* add dash line */}
      {showMore ? <div 
        className='mt-2 border-dashed border-t border-gray-200  '
     /> : null}
      


      {showMore ? (
        <div className='grid grid-cols-1 gap-4 gap-y-2 text-sm mt-2'>
        {visibleCells.map((cell: any, cellIndex: any) => {
          // Skip id and status as they're already shown above
          if (
            cell.column.id === 'id'
            || cell.column.id === 'status'
            || cell.column.id === 'categories'
            || cell.column.id === 'code'
            || cell.column.id === 'expand'
          ) return null

          //selectedDefaultCells must hidden
          if (selectedDefaultCells?.length && selectedDefaultCells?.map((cell: any) => cell.column.id).includes(cell.column.id)) return null

          if (!showMore && cellIndex >= 5) return null
          return (
            <div
              className='flex flex-row text-xs text-foreground items-center justify-between'
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
      ) : null}
      {visibleCells?.length > 6 && (
        <button
            className='mt-3 text-sm text-primary'
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
              <div className={cn(`absolute left-1 w-[1px]  bg-primary/65`, `${gridLevel > 1 ? 'h-[50%]' : 'h-[60%]'} `)}>
                <div className='absolute w-2 h-[1px] bg-primary/65 left-0 bottom-0'>
                  <div className='absolute w-[6px] h-[6px] rounded-full bg-primary right-[-3px] bottom-[-2px]' />
                </div>
              </div>
               {state?.config?.rowExpansionBuilder ? (
                        typeof state?.config?.rowExpansionBuilder ===
                        'function' ? (
                          state?.config?.rowExpansionBuilder({
                            rowData: row.original,
                            viewMode: 'card',
                          })
                        ) : (
                          React.cloneElement(
                            state?.config?.rowExpansionBuilder,
                            { rowData: row.original, viewMode: 'card', },
                          )
                        )
                      ) : (
                        <span>Provide your expand component</span>
                      )}
            </div>
          ) : null  }
    </>
  )
}

GridCardViewContent.displayName = 'GridCardViewContent'
export default GridCardViewContent
