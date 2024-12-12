"use client";

import { useContext } from "react";
import { TableHead, TableRow } from "~/components/ui/table";
import { GridContext } from "./Provider";
import { cn } from "~/lib/utils";
import { ColumnResizer } from "./column-resizer";
import { flexRender } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./ColumnPining";
import HeaderMenu from "./common/HeaderMenu";
import { ScrollContainerContext } from "./Server/views/common/GridScrollContainer";

export default function MyTableHead() {
  const { state } = useContext(GridContext);
  return (
    <>
      {state?.table.getHeaderGroups().map((headerGroup, index) => (
        <TableRow
          className="backdrop-blur-lg"
          key={headerGroup.id + "group" + index}
          data-test-id={state.config.entity + "_grid_header_row"}
        >
          {headerGroup.headers.map((header, index) => {
            const cellValue = header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext());
            return (
              <TableHead
                key={header.id + index}
                data-test-id={
                  state.config.entity + "_grid_header_" + header.column.id
                }
                className={cn(
                  "group relative font-medium text-muted-foreground", // originally bg-grid-header
                  getCommonPinningStyles(header?.column).className,
                  // @ts-expect-error - TS doesn't know about meta
                  header.column.columnDef.meta?.className,
                )}
                style={{
                  width: header.getSize(),
                  ...getCommonPinningStyles(header?.column).style,
                }}
              >
                <div
                  className={cn(
                    "flex flex-row items-center",
                    header.column.id === "action"
                      ? "justify-center"
                      : "justify-between",
                  )}
                >
                  <div className="flex flex-row items-center gap-1">
                    {cellValue}
                    {/* {!!cellValue &&
                      header.column.id !== "action" &&
                      typeof cellValue === "string" &&
                      cellValue !== "Actions" && (
                        <Button
                          onClick={() => {
                            // header.column.toggleSort();
                          }}
                        >
                          <ChevronsUpDown className="h-3 w-3" />
                        </Button>
                      )} */}
                  </div>
                  <HeaderMenu header={header} />
                </div>

                {/* {!header.isPlaceholder && header.column.getCanPin() && (
                  <div className="flex justify-center gap-1">
                    {header.column.getIsPinned() !== "left" ? (
                      <button
                        className="rounded border px-2"
                        onClick={() => {
                          header.column.pin("left");
                        }}
                      >
                        {"<="}
                      </button>
                    ) : null}
                    {header.column.getIsPinned() ? (
                      <button
                        className="rounded border px-2"
                        onClick={() => {
                          header.column.pin(false);
                        }}
                      >
                        X
                      </button>
                    ) : null}
                    {header.column.getIsPinned() !== "right" ? (
                      <button
                        className="rounded border px-2"
                        onClick={() => {
                          header.column.pin("right");
                        }}
                      >
                        {"=>"}
                      </button>
                    ) : null}
                  </div>
                )} */}
                <ColumnResizer header={header} />
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
