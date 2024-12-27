"use client";
import { useContext, useMemo } from "react";
import { GridContext } from "../../../Provider";
import { Badge } from "~/components/ui/badge";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import { flexRender } from "@tanstack/react-table";
import { testIDFormatter } from "~/utils/formatter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { ArchiveIcon, EllipsisVertical, PencilIcon } from "lucide-react";

export default function GridCardView() {
  const { state } = useContext(GridContext);
  const size = useScreenType();

  const getCols = useMemo(() => {
    switch (size) {
      case "sm": return 'grid-cols-1';
      case "md": return 'grid-cols-2';
      case "lg": return 'grid-cols-2';
      case "xl":
      case "2xl": return 'grid-cols-3';
      default: return 'grid-cols-1';
    }
  }, [size]);

  return (
    <div
      className={cn('overflow-y-auto grid gap-4', getCols)}
      data-test-id={testIDFormatter(`${state?.config.entity}-grd-crd-container`)}
    >
      {state?.table.getRowModel().rows?.length ? (
        state?.table.getRowModel().rows.map((row, rowIndex) => {
          // Get visible cells excluding action column
          const visibleCells = row.getVisibleCells().filter(
            cell => cell.column.id !== 'action'
          );

          const idCell = row.getVisibleCells().find(cell => cell.column.id === 'id');
          const statusCell = row.getVisibleCells().find(cell => cell.column.id === 'status');

          return (
            <div
              className="flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 hover:bg-border/50"
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              data-test-id={testIDFormatter(`${state?.config.entity}-grd-crd-item-${rowIndex + 1}`)}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                {statusCell && flexRender(
                  statusCell.column.columnDef.cell,
                  statusCell.getContext()
                )}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer">
                        <EllipsisVertical
                          className={`h-4 w-4 text-foreground font-semibold`}
                          aria-hidden="true"

                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        className="flex gap-2 relative items-center text-primary"
                        onClick={() => {

                        }}>
                        <PencilIcon className={`h-4 w-4`} aria-hidden="true" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex gap-2 relative items-center text-danger-foreground"
                        onClick={() => {

                        }}>
                        <ArchiveIcon className={`h-4 w-4 `} aria-hidden="true" />
                        <span>Delete</span>
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {visibleCells.map((cell, cellIndex) => {
                  // Skip id and status as they're already shown above
                  if (cell.column.id === 'id' || cell.column.id === 'status') return null;

                  return (
                    <div
                      key={cell.id}
                      className="flex flex-row text-xs text-foreground"
                      data-test-id={testIDFormatter(`${state?.config.entity}-grd-crd-item-cell-${cell.column.id}-${cellIndex + 1}`)}
                    >
                      <div className="text-slate-500 mr-2">
                        {flexRender(
                          cell.column.columnDef.header,
                          // @ts-expect-error - TS doesn't know about getContext
                          cell.getContext()
                        )}
                      </div>
                      <div>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div>
          <div className="h-24 text-center text-foreground">No results.</div>
        </div>
      )}
    </div>
  );
}