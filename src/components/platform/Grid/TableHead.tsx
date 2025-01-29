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
import { testIDFormatter } from "~/utils/formatter";
import { FilterIcon, ChevronUp, ChevronDown, ArrowBigDown, ArrowBigUp } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
export default function MyTableHead() {
  const { state } = useContext(GridContext);
  return (
    <>
      {state?.table.getHeaderGroups().map((headerGroup, index) => (
        <TableRow
          className="backdrop-blur-lg"
          key={headerGroup.id + "group" + index}
          data-test-id={testIDFormatter(
            `${state.config.entity}-grd-tbl-thead-row`,
          )}
        >
          {headerGroup.headers.map((header, index) => {
            const sortingState = state?.sorting?.find(
              (item) =>
                item.id === header?.id ||
                item.id === (header?.column?.columnDef as any)?.sortKey,
            );
            const defaultFilter = state?.defaultAdvanceFilter?.filter(
              (filter) => filter.field === header.id,
            );

            const cellValue = header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext());
            return (
              <TableHead
                key={header.id + index}
                data-test-id={testIDFormatter(
                  `${state.config.entity}-grd-tbl-thead-row-${header.column.id}`,
                )}
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
                  <div className="flex flex-row items-center gap-1 whitespace-nowrap">
                    {cellValue}
                    {/* {!!cellValue &&
                      header.column.id !== "action" &&
                      typeof cellValue === "string" &&
                      cellValue !== "Actions" && (
                        <Button
                          onClick={() => {
                            // header.column.toggleSort();
                          }}
                          data-test-id={state.config.entity + "_grid_header_" + header.column.id + "_sort_button"}
                        >
                          <ChevronsUpDown className="h-3 w-3" />
                        </Button>
                      )} */}
                    {sortingState && !sortingState.desc && (
                      <ArrowUpIcon className="h-4 w-4" />
                    )}
                    {sortingState && sortingState.desc && (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {!!defaultFilter?.length && (
                      <FilterIcon className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <HeaderMenu header={header} defaultFilter={defaultFilter} />
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
