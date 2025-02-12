import * as React from "react";

import { cn } from "~/lib/utils";
import { handleEdit } from "../platform/Grid/DefatultRow/Actions";
type GridParentType = 'grid' | 'form' | 'field' | 'grid_expansion' | 'record';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  // <div className="inline-block min-w-full align-middle">
  <table ref={ref} className={cn("min-w-full", className)} {...props} />
  // </div>
));
Table.displayName = "Table";

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
  <tbody ref={ref} className={cn("bg-background", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-muted/50 data-[state=selected]:bg-sky-50",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    scope="col"
    ref={ref}
    className={cn(
      "px-2 py-2.5 text-left text-sm font-semibold text-gray-900 h-[44px]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    row?: any;
    config?: any;
    column_id?: any;
  }
>(({ className, row, config, column_id, ...props }, ref) => (
  <td
    ref={ref}
    onClick={() => {
      if (!["select", "action"].includes(column_id) && config?.enableRowClick) {
        if (config?.rowClickCustomAction) {
          config.rowClickCustomAction({ row, config });
          return;
        }
        handleEdit({ row, config });
      }
    }}
    className={cn(
      "whitespace-nowrap px-2 py-2 text-sm text-gray-500" +
        (config?.enableRowClick ? " cursor-pointer" : ""),
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
