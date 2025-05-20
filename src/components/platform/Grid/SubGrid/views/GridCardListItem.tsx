'use client'
import { flexRender, type Row } from '@tanstack/react-table'
import { capitalize } from 'lodash'
import { ChevronDown } from 'lucide-react'
import { useContext, useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { cn } from '~/lib/utils'

import { GridContext } from '../../Provider'
import useScreenType from '~/hooks/use-screen-type'

type GridCardListItemProp = {
  row: Row<any>
  options : any
}

const GridCardListItem = ({ row, options }: GridCardListItemProp) => {

  const {targetColumns, excludedCols} = options ?? {}
  const [isOpen, setIsOpen] = useState(false)
  const { state } = useContext(GridContext)
  const screenType = useScreenType()
  const isMobile  = screenType === 'sm' || screenType ==='xs' || screenType ==='md'

  const expandIconPos = state?.config?.expandTriggerPosition ?? 'right'

  const labelCell = row
    .getVisibleCells()
    .find(cell => cell.column.id === targetColumns?.label)



  const contentCell = row
    .getVisibleCells()
    .find(cell => cell.column.id === targetColumns?.content)

  const headerCell = row
    .getVisibleCells()
    .find(cell => cell.column.id === targetColumns?.headerCell)
    

  const headerComponent = headerCell
    ? flexRender(headerCell.column.columnDef.cell, headerCell.getContext())
    : null


  const content = contentCell
    ? flexRender(contentCell.column.columnDef.cell, contentCell.getContext())
    : null

    const labelContent = labelCell
    ? flexRender(labelCell.column.columnDef.cell, labelCell.getContext())
    : null



  const excludedColumns = excludedCols || [
    'select',
    'id',
    'header-cell',
    'code',
    'action',
  ];

  const visibleCells = row
    .getVisibleCells()
    .filter(cell => !excludedColumns.includes(cell.column.id))

  const gridColsClass
    = {
      1: 'lg:grid-cols-2',
      2: 'lg:grid-cols-3',
      3: 'lg:grid-cols-4',
      4: 'lg:grid-cols-5',
      5: 'lg:grid-cols-6',
      6: 'lg:grid-cols-7',
    }[visibleCells.length] || 'lg:grid-cols-auto'

  const triggerButton = (
    <CollapsibleTrigger className="flex justify-end px-2">
      <ChevronDown
        className={cn(
          'h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180 transform',
        )}
      />
    </CollapsibleTrigger>
  )


  return (
    <div className="rounded-md border border-default/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-2 lg:gap-4 gap-1 ', 
            isOpen && 'border-b border-default/10',
          )}
        >

          <div className="flex items-center justify-between lg:justify-start">
            {expandIconPos === 'left' && !isMobile
              ? (
                triggerButton
                )
              : null}
            <div className='flex-row flex items-center'>
              {headerComponent}
                {labelContent}
              {/* <div className="text-sm font-semibold ml-4">{label || 'N/A'}</div> */}
            </div>
            {isMobile ? (
             triggerButton
            ) : null}
          </div>
          <div className={cn('lg:grid flex items-center p-2 flex-wrap gap-x-3 lg:gap-x-0 flex-row-reverse lg:direction-rtl', gridColsClass)}>
            {visibleCells.map(cell => (
              <div className="flex items-center gap-2 justify-end" key={cell.column.id}>
                <span className="text-sm font-semibold text-muted-foreground">
                  {capitalize(cell.column.id.replace(/_/g, ' '))}
                </span>
                <span className="text-sm font-medium">
                  {(() => {
                    const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())
                    return rendered ?? 'N/A'
                  })()}
                </span>
              </div>
            ))}
            {expandIconPos === 'right' && !isMobile
              ? (
                  triggerButton
                )
              : null}
          </div>
        </div>
        <CollapsibleContent>
          {content}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
};

export default GridCardListItem
