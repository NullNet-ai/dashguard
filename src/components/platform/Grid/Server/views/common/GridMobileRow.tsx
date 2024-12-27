"use client";
import { useContext } from "react";
import { GridContext } from "../../../Provider";
import { Badge } from "~/components/ui/badge";
import { capitalize } from "lodash";
import StatusCell from "~/components/ui/status-cell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { ArchiveIcon, EllipsisVertical, PencilIcon } from "lucide-react";

export default function GridMobileRow() {
  const { state } = useContext(GridContext);
  
  return (
    <div className="overflow-y-auto">
      {state?.table.getRowModel().rows?.length ? (
        state?.table.getRowModel().rows.map((row) => {
          const orig = row.original;
          return (
            <div
              className="mb-4 flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 hover:bg-border/50 relative"
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              <div className="mb-4 flex items-start gap-2">
                <Badge variant={"primary"}>{row.id}</Badge>
                {row.getValue("status") ? (
                  <StatusCell value={row.getValue("status")} />
                ) : null}
              </div>
              <div className="absolute right-2 top-2">
                  <DropdownMenu
                               
                  >
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer">
                        <EllipsisVertical
                          className={`h-4 w-4 text-foreground font-semibold`}
                          aria-hidden="true"

                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(orig).map(([key, value]: any[]) => {
                  if (key === "id" || key === "status" || key === "tombstone")
                    return null;
                  if (value === null) return null;

                  return (
                    <div key={key} className="w-[48%] text-xs text-foreground">
                      <span className="text-slate-500">
                        {capitalize(removeUnderscore(key))}:{" "}
                      </span>
                      <span className="">{value}</span>
                    </div>
                  );
                })}
              </div>
              {/* {row.getVisibleCells().map((cell, index) => (
                    <div
                      className={cn(
                        "hover:bg-border text-foreground relative",
                      )}
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))} */}
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

const removeUnderscore = (str: string) => str.replace(/_/g, " ");
