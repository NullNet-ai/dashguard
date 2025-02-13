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

type GridCardListItemProp = {
  row: Row<any>
}

const GridCardListItem = ({ row }: GridCardListItemProp) => {
  const [isOpen, setIsOpen] = useState(false)
  const { state } = useContext(GridContext)

  const expandIconPos = state?.config?.expandTriggerPosition ?? 'right'

  const label = row
    .getVisibleCells()
    .find(cell => cell.column.id === 'label')
    ?.getValue() as string
  const contentCell = row
    .getVisibleCells()
    .find(cell => cell.column.id === 'content')

  const headerCell = row
    .getVisibleCells()
    .find(cell => cell.column.id === 'header-cell')

  const headerComponent = headerCell
    ? flexRender(headerCell.column.columnDef.cell, headerCell.getContext())
    : null

  const content = contentCell
    ? flexRender(contentCell.column.columnDef.cell, contentCell.getContext())
    : null

  const excludedColumns = [
    'select',
    'id',
    'header-cell',
    'label',
    'action',
    'content',
  ]

  const visibleCells = row
    .getVisibleCells()
    .filter(cell => !excludedColumns.includes(cell.column.id))

  const gridColsClass
    = {
      1: 'grid-cols-2',
      2: 'grid-cols-3',
      3: 'grid-cols-4',
      4: 'grid-cols-5',
      5: 'grid-cols-6',
      6: 'grid-cols-7',
    }[visibleCells.length] || 'grid-cols-auto'

  return (
    <div className="rounded-md border border-default/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            'grid grid-cols-2 gap-4', isOpen && 'border-b border-default/10',
          )}
        >

          <div className="flex items-center">
            {expandIconPos === 'left'
              ? (
                  <CollapsibleTrigger className="flex justify-end px-2">
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180 transform',
                      )}
                    />
                  </CollapsibleTrigger>
                )
              : null}
            {headerComponent}
            <div className="text-sm font-semibold ml-4">{label || 'Label Here'}</div>
          </div>
          <div className={cn('grid items-center', gridColsClass)}>
            {visibleCells.map(cell => (
              <div className="flex items-center gap-2" key={cell.column.id}>
                <span className="text-sm font-semibold text-muted-foreground">
                  {capitalize(cell.column.id)}
                </span>
                <span className="text-sm font-medium">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            ))}
            {expandIconPos === 'right'
              ? (
                  <CollapsibleTrigger className="flex justify-end px-2">
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform', isOpen && 'rotate-180 transform',
                      )}
                    />
                  </CollapsibleTrigger>
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
