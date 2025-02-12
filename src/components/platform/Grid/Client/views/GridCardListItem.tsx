'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { ChevronDown, Link2, Wrench } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useState } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { capitalize } from 'lodash';

type GridCardListItemProp = {
  row: Row<any>;
};

const GridCardListItem = ({ row }: GridCardListItemProp) => {
  const [isOpen, setIsOpen] = useState(false);

  const label = row
    .getVisibleCells()
    .find((cell) => cell.column.id === 'label')
    ?.getValue() as string;
  const headerCell = row
    .getVisibleCells()
    .find((cell) => cell.column.id === 'header-cell');

  const headerComponent = headerCell 
    ? flexRender(headerCell.column.columnDef.cell, headerCell.getContext())
    : null;

  const excludedColumns = ['select', 'id', 'header-cell', 'label', 'action'];
    
  const visibleCells = row.getVisibleCells()
    .filter(cell => !excludedColumns.includes(cell.column.id));
    
  const gridColsClass = {
    1: 'grid-cols-2',
    2: 'grid-cols-3',
    3: 'grid-cols-4',
    4: 'grid-cols-5',
    5: 'grid-cols-6',
    6: 'grid-cols-7',
  }[visibleCells.length] || 'grid-cols-auto';
    
  return (
    <div className="rounded-md border border-default/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            'grid grid-cols-2 gap-4',
            isOpen && 'border-b border-default/10',
          )}
        >
          <div className="flex items-center gap-4">
            {headerComponent}
            <div className="text-sm font-semibold">{label || 'Label Here'}</div>
          </div>
          <div className={cn('grid items-center', gridColsClass)}>
            {visibleCells.map((cell) => (
              <div className="flex items-center gap-2" key={cell.column.id}>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {capitalize(cell.column.id)}
                  </span>
                  <span className="text-sm font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </span>
                </div>
              ))}
            <CollapsibleTrigger className="flex justify-end px-2">
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180 transform',
                )}
              />
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="flex flex-col gap-6 p-4 pl-10">
            <div className="flex items-start gap-4">
              <code className="block w-full rounded bg-slate-900 p-4 font-mono text-sm text-slate-100">
                &lt;img draggable="false" role="img" class="emoji" alt=""
                src="https://s.w.org/images/core/emoji/15.0.3/svg/1f609.svg"&gt;&lt;/img&gt;
              </code>
            </div>
            <div className="flex items-start gap-4">
              <code className="block w-full rounded bg-slate-900 p-4 font-mono text-sm text-slate-100">
                123123
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4" />
              <span>
                Ensure that all SVG or Image elements that are added as markup
                into the HTML, have a valid label that are used to provide an
                accessible name for the SVG or image elements.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <Link2 className="h-4 w-4" />
              <a
                href="https://www.grandcentralartcenter.com/category/past/page/37/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.grandcentralartcenter.com/category/past/page/37/
              </a>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default GridCardListItem;
