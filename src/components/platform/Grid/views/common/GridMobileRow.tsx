"use client";
import { useContext } from "react";
import { GridContext } from "../../Provider";
import { Badge } from "~/components/ui/badge";
import { capitalize } from "lodash";
import StatusCell from "~/components/ui/status-cell";

export default function GridMobileRow() {
  const { state } = useContext(GridContext);
  return (
    <div className="overflow-y-auto">
      {state?.table.getRowModel().rows?.length ? (
        state?.table.getRowModel().rows.map((row) => {
          const orig = row.original;
          return (
            <div
              className="mb-4 flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 hover:bg-border/50"
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              <div className="mb-4 flex items-start gap-2">
                <Badge variant={"primary"}>{row.id}</Badge>
                {row.getValue("status") ? (
                  <StatusCell value={row.getValue("status")} />
                ) : null}
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
          <div className="h-24 text-center text-foreground text-sm lg:text-base">No results.</div>
        </div>
      )}
    </div>
  );
}

const removeUnderscore = (str: string) => str.replace(/_/g, " ");
