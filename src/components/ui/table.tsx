import * as React from 'react';

import { cn } from '~/lib/utils';
import { handleEdit } from '../platform/Grid/DefatultRow/Actions';
import { useSideDrawer } from '../platform/SideDrawer';
// import { handleCustomAction } from '../platform/Grid/Handlers/rowClickCustomAction';

type GridParentType = 'grid' | 'form' | 'field' | 'grid_expansion';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    withStripedRows?: boolean;
    withVerticalLines?: boolean;
    zebra?: boolean;
  }
>(({ className, withStripedRows, withVerticalLines, zebra, ...props }, ref) => (
  <table 
    ref={ref} 
    className={cn(
      'min-w-full',
      (withStripedRows || zebra) && '[&_tbody_tr:nth-child(even)]:bg-slate-50',
      withVerticalLines && '[&_td]:border-r [&_td:last-child]:border-r-0 [&_th]:border-r [&_th:last-child]:border-r-0 [&_td]:border-gray-200 [&_th]:border-gray-200',
      className
    )} 
    {...props} 
  />
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<
    HTMLTableSectionElement & { parentType?: GridParentType }
  > & { parentType?: GridParentType }
>(
  (
    {
      className,
      parentType,
      ...props
    }: React.HTMLAttributes<HTMLTableSectionElement> & {
      parentType?: GridParentType;
    },
    ref,
  ) => (
    <thead
      ref={ref}
      className={cn(
        'sticky top-0',
        `${parentType !== 'grid_expansion' ? 'z-50 bg-muted [&_tr]:border-b [&_tr]:border-sky-100' : 'z-0 border-b border-b-gray-200'}`,
        className,
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('bg-background', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    isEven?: boolean;
  }
>(({ className, isEven, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors hover:bg-muted/50 data-[state=selected]:bg-sky-50',
      isEven && 'bg-gray-50',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    scope="col"
    ref={ref}
    className={cn(
      'h-[35px] px-2 text-left text-sm font-semibold text-gray-900',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    row?: any;
    config?: any;
    column_id?: any;
  }
>(({ className, row, config, column_id, ...props }, ref) => {
  const { actions } = useSideDrawer();

  return (
    <td
      ref={ref}
      onClick={() => {
        if (
          !['select', 'action', 'expand'].includes(column_id) &&
          config?.enableRowClick && !row.original.is_group_by
        ) {
          if (config?.rowClickCustomAction) {
            if (typeof config?.rowClickCustomAction === 'function') {
              config?.rowClickCustomAction({ row, config });
              return;
            }
            // handleCustomAction({ config, row, actions });
            return;
          }
          handleEdit({ row, config });
        }
      }}
      className={cn(
        'whitespace-nowrap px-2 py-1 text-sm text-gray-500' +
          (config?.enableRowClick && !row.original.is_group_by ? ' cursor-pointer' : ''),
        className,
      )}
      {...props}
    />
  )
});
TableCell.displayName = 'TableCell';

// Add SummaryRow component
const SummaryRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    colSpan?: number;
    align?: 'left' | 'center' | 'right';
    variant?: 'default' | 'total' | 'subtotal';
  }
>(({ className, colSpan = 1, align = 'left', variant = 'default', children, ...props }, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'total':
        return 'bg-sky-50 text-sky-900 font-semibold';
      case 'subtotal':
        return 'bg-gray-100 text-gray-800 font-medium';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        getVariantClasses(),
        className,
      )}
      {...props}
    >
      <td 
        colSpan={colSpan} 
        className={cn(
          'px-2 py-2 text-sm border-t border-b border-gray-200',
          getAlignClasses()
        )}
      >
        {children}
      </td>
    </tr>
  );
});
SummaryRow.displayName = 'SummaryRow';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  SummaryRow,
};
