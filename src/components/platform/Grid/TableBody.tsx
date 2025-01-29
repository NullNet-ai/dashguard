import { useContext } from "react";
import { TableBody, TableCell, TableRow } from "~/components/ui/table";
import { GridContext } from "./Provider";
import { flexRender } from "@tanstack/react-table";
import { getCommonPinningStyles } from "./ColumnPining";
import { cn } from "~/lib/utils";
import ArchiveConfirmationModal from "./views/ArchiveConfirmationModal";
import { ScrollContainerContext } from "./Server/views/common/GridScrollContainer";
import { testIDFormatter } from "~/utils/formatter";
import BulkActionConfirmationModal from "./views/common/BulkActionConfirmationModal";
import Grid from "~/components/platform/Grid/Client";

export default function MyTableBody({ showAction }: { showAction?: boolean }) {
  const { state, actions } = useContext(GridContext);

  const context = useContext(ScrollContainerContext);
  const { isEndReached = false } = context ?? {};

  const defaultData = [
    {
      id: 1,
      name: "John Doe",
      age: 28,
      details: "Loves coding and coffee",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 34,
      details: "Enjoys hiking and photography",
    },
  ];


  return (
    <>
      <TableBody
        className="overflow-y-auto"
        data-test-id={testIDFormatter(`${state?.config.entity}-grd-tbl-tbody`)}
      >
        {state?.table.getRowModel().rows?.length ? (
          state?.table.getRowModel().rows.map((row, index) => (
            <>
              <TableRow
                className="group relative border-b hover:bg-border/50"
                key={row.id + index}
                data-state={row.getIsSelected() && "selected"}
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-tbl-tbody-row-${row.id + (index + 1)}`,
                )}
              >
                {row.getVisibleCells().map((cell, index) => {
                  if (cell.column.id === "action") {
                    return (
                      <td
                        key={cell.id + index}
                        className={cn("right-0", isEndReached ? "" : "sticky")}
                      >
                        <div className="px-3">
                          <div
                            className={cn(
                              "items-center",
                              `${showAction ? "opacity-100" : "opacity-0"}`,
                              !isEndReached ? "group-hover:opacity-100" : "",
                            )}
                          >
                            <div className="flex h-8 items-center justify-center gap-x-4 rounded-xl bg-background px-4 shadow-md">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <TableCell
                      className={cn(
                        "relative text-sm text-foreground hover:bg-border",
                        getCommonPinningStyles(cell.column).className,
                      )}
                      key={cell.id + index}
                      row={cell?.row}
                      config={state?.config}
                      column_id={cell?.column?.id}
                      data-test-id={testIDFormatter(
                        `${state?.config.entity}-grd-tbl-tbody-row-cell-${cell.column.id + "-" + (index + 1)}`,
                      )}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        ...getCommonPinningStyles(cell.column).style,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                      <div
                        {...{
                          className: `absolute  border border-tertiary  top-[50%] translate-y-[-50%] right-0 cursor-col-resize w-px h-full bg-background  hover:bg-sky-700 hover:w-1 hover:h-10 hover:rounded-lg`,
                          // className: `absolute top-[50%] translate-y-[-50%] right-0 cursor-col-resize w-px h-full  border  hover:bg-sky-700 hover:w-1 hover:h-10 hover:rounded-lg`,
                          style: {
                            // userSelect: "none",
                            // touchAction: "none",
                          },
                        }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
              {/* Expanded Row */}
              {row.getIsExpanded() && (
                <TableRow className="group relative border-b hover:bg-border/50">
                  <td
                    colSpan={state?.table.getVisibleLeafColumns().length}
                    className="bg-gray-50 p-2"
                  >
                    <div className="rounded-md border bg-white p-3 shadow">
                      <strong>Details:</strong> {JSON.stringify(row.original)}
                      <Grid
                        totalCount={2}
                        data={defaultData}
                        defaultSorting={[{ id: "name", desc: false }]}
                        defaultAdvanceFilter={[]}
                        advanceFilter={[]}
                        sorting={[]}
                        pagination={{
                          current_page: 1,
                          limit_per_page: 10,
                        }}
                        config={{
                          entity: "contact",
                          title: "Contacts",
                          columns: [
                            {
                              header: "Name",
                              accessorKey: "name",
                            },
                            {
                              header: "Age",
                              accessorKey: "age",
                            },
                            {
                              header: "Details",
                              accessorKey: "details",
                            },
                          ],
                          enableAutoCreate: false,
                        }}
                      />
                    </div>
                  </td>
                </TableRow>
              )}
            </>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={state?.config?.columns.length}
              className="h-24 text-center text-foreground"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {state?.showArchiveConfirmationModal && (
        <ArchiveConfirmationModal
          open={state?.showArchiveConfirmationModal}
          setOpen={actions?.setShowArchiveConfirmationModal!}
          record={state?.rowToArchive}
          config={state?.config}
        />
      )}
      {state?.showBulkActionConfirmationModal && (
        <BulkActionConfirmationModal
          open={state?.showBulkActionConfirmationModal}
          onOpenChange={actions?.setShowBulkActionConfirmationModal!}
          action_type={state?.bulkActionType}
        />
      )}
    </>
  );
}
