"use client";
import { useContext, useMemo } from "react";
import { GridContext } from "../../../Provider";
import { Badge } from "~/components/ui/badge";
import { capitalize } from "lodash";
import StatusCell from "~/components/ui/status-cell";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";

export default function GridCardView() {
  const { state } = useContext(GridContext);

  const size = useScreenType();


  const getCols = useMemo(() => {
    if (size === "sm") {
      return 'grid-cols-1';
    }
    else if (size === "md") {
      return 'grid-cols-2';
    }
    else if ( size === "xl" || size === "2xl") {
      return 'grid-cols-3';
    }
    else if (size === "lg") {
      return 'grid-cols-2'
    }
    else {
      return 'grid-cols-1'
    }
  }, [size])
  
  
  return (
    <div className={cn('overflow-y-auto grid  gap-4', getCols)}>
      {state?.table.getRowModel().rows?.length ? (
        state?.table.getRowModel().rows.map((row) => {
          const orig = row.original;
          return (
            <div
              className="mb-0 flex flex-col justify-start rounded-md border border-b border-l-2 border-l-primary p-4 hover:bg-border/50"
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
          <div className="h-24 text-center text-foreground">No results.</div>
        </div>
      )}
    </div>
  );
}

const removeUnderscore = (str: string) => str.replace(/_/g, " ");
