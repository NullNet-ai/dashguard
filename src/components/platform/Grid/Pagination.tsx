"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { cn } from "~/lib/utils";
import { useContext, useMemo } from "react";
import { GridContext } from "./Provider";
import { Select, SelectContent, SelectItem } from "~/components/ui/select";
import { SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { useSidebar } from "~/components/ui/sidebar";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";
import { Button } from "~/components/ui/button";
import { UpdateReportPagination } from "./Action/UpdateReportPagination";
export default function Pagination() {
  const { state } = useContext(GridContext);

  // const { open } = useSidebar();
  const open = false

  const { currentPage, totalPages, rows, totalRows } = useMemo(() => {
    const { current_page = 1, limit_per_page = 100 } = state?.pagination ?? {};
    const getTotalRows = state?.totalCount || 0;
    const getTotalPages = Math.ceil(getTotalRows / Number(limit_per_page));
    return {
      currentPage: current_page,
      totalPages: getTotalPages,
      rows: limit_per_page,
      totalRows: getTotalRows,
    };
  }, [state?.pagination, state?.totalCount]);

  const rowsPerPage = [10, 20, 30, 40, 50, 100];

  const handlePerPageValueChange = (value: string) => {
    UpdateReportPagination({
      current_page: 1,
      limit_per_page: Number(value),
    });
  };

  const handlePaginationChange = (page: number) => {
    UpdateReportPagination({
      current_page: Number(page),
      limit_per_page: Number(rows),
    });
  };

  const generatePaginationText = (
    limit: number,
    pageNumber: number,
    totalCount: number,
  ): string => {
    const start = (pageNumber - 1) * limit + 1;
    const end = Math.min(pageNumber * limit, totalCount);

    return `Showing ${start} to ${end} of ${totalCount} results`;
  };

  const width = open
    ? " md:w-[calc(100%-265px)] md:left-[258px]"
    : "md:w-[calc(100%-70px)] md:left-[80px]";
  return (
    <div
      className={cn(
        "border-grid-header bg-grid-footer fixed bottom-14 flex w-full items-center justify-between bg-background px-4 py-2 transition-all duration-300 ease-in-out sm:px-4 sm:py-0 lg:static lg:w-full",
        width,
      )}
    >
      <div className="flex w-full flex-1 justify-between sm:hidden">
        <a
          href={`?page=${Math.max(Number(currentPage) - 1 || 1)}&perPage=${rows}`}
          data-test-id={testIDFormatter(
            `${state?.config.entity}-grd-pagination-page-prev-btn`,
          )}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          data-test-id={testIDFormatter(
            `${state?.config.entity}-grd-pagination-page-next-btn`,
          )}
          href={`?page=${Math.min(Number(currentPage) + 1, totalPages)}&perPage=${rows}`}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>

      <div className="hidden flex-col gap-x-2 sm:flex sm:flex-1 sm:items-center sm:justify-between lg:flex-row">
        <div className="flex w-full flex-1 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {generatePaginationText(rows, currentPage, totalRows)}
            </span>
          </p>
          <div className="flex items-center justify-center gap-4">
            <Label className="whitespace-nowrap">Rows per page</Label>
            <Select
              onValueChange={handlePerPageValueChange}
              defaultValue={`${rows}` || "10"}
            >
              <SelectTrigger
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-row-per-page-sel-trigger`,
                )}
              >
                <SelectValue placeholder={`${rows} rows`} />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPage.map((row) => (
                  <SelectItem
                    value={row.toString()}
                    key={row}
                    data-test-id={testIDFormatter(
                      `${state?.config.entity}-grd-pagination-row-per-page-sel-itm-${row}`,
                    )}
                  >
                    {row}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-10 lg:w-auto">
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-first-page-btn`,
              )}
              variant="ghost"
              size="icon"
              onClick={() => handlePaginationChange(1)}
              disabled={currentPage == 1}
            >
              <ChevronDoubleLeftIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-prev-page-btn`,
              )}
              variant="ghost"
              size="icon"
              onClick={() =>
                handlePaginationChange(Math.max(Number(currentPage) - 1, 1))
              }
              disabled={currentPage == 1}
            >
              <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-page1-btn`,
              )}
              variant={currentPage == 1 ? "softPrimary" : "ghost"}
              size="icon"
              onClick={() => handlePaginationChange(1)}
            >
              1
            </Button>
            {totalPages > 1 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-page2-btn`,
                )}
                variant={currentPage == 2 ? "softPrimary" : "ghost"}
                size="icon"
                onClick={() => handlePaginationChange(2)}
              >
                2
              </Button>
            )}

            {totalPages > 3 ? (
              <span className="relative mt-1 inline-flex items-center px-4 text-sm font-semibold text-gray-700 focus:outline-offset-0">
                <Menu
                  as="div"
                  className="relative inline-block text-left"
                  data-test-id={camelCase(
                    `${state?.config.entity}PaginationPageMenu`,
                  )}
                >
                  <MenuItems
                    transition
                    className="absolute bottom-full left-0 z-10 mb-2 origin-bottom-left rounded-md bg-white p-2 shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <div className="flex max-h-72 flex-col overflow-auto py-1">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <MenuItem key={index + 1}>
                          <Button
                            data-test-id={testIDFormatter(
                              `${state?.config.entity}-grd-pagination-page-menu-${index + 1}`,
                            )}
                            variant={
                              currentPage == index + 1 ? "softPrimary" : "ghost"
                            }
                            size="icon"
                            onClick={() => handlePaginationChange(index + 1)}
                          >
                            {index + 1}
                          </Button>
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>

                  {totalPages > 1 && (
                    <div>
                      <MenuButton
                        data-test-id={testIDFormatter(
                          `${state?.config.entity}-grd-pagination-page-menu-trigger-horizontal`,
                        )}
                        className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5 rounded-full border" />
                      </MenuButton>
                    </div>
                  )}
                </Menu>
              </span>
            ) : null}
            {totalPages > 2 && (
              <Button
                data-test-id={testIDFormatter(
                  `${state?.config.entity}-grd-pagination-last-page-btn`,
                )}
                variant={currentPage == totalPages ? "softPrimary" : "ghost"}
                size="icon"
                onClick={() => handlePaginationChange(totalPages)}
              >
                {totalPages}
              </Button>
            )}

            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-next-btn`,
              )}
              variant={"ghost"}
              size="icon"
              onClick={() =>
                handlePaginationChange(
                  Math.min(Number(currentPage) + 1, totalPages),
                )
              }
              disabled={currentPage == totalPages}
            >
              <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
            </Button>

            <Button
              data-test-id={testIDFormatter(
                `${state?.config.entity}-grd-pagination-last-btn`,
              )}
              variant={"ghost"}
              size="icon"
              onClick={() => handlePaginationChange(totalPages)}
              disabled={currentPage == totalPages}
            >
              <ChevronDoubleRightIcon aria-hidden="true" className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
