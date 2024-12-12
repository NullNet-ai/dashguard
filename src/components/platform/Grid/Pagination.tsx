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
import { useContext, useMemo, useState } from "react";
import { GridContext } from "./Provider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem } from "~/components/ui/select";
import { SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { useSidebar } from "~/components/ui/sidebar";
export default function Pagination() {
  const { state } = useContext(GridContext);

  const { open } = useSidebar();

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const { currentPage, totalPages, rows, totalRows } = useMemo(() => {
    const getCurrentPage = searchParams.get("page") ?? 1;
    const getTotalRows = state?.totalCount || 0;
    const getRows = searchParams.get("perPage") ?? 100;
    const getTotalPages = Math.ceil(getTotalRows / Number(getRows));
    return {
      currentPage: getCurrentPage,
      totalPages: getTotalPages,
      rows: getRows,
      totalRows: getTotalRows,
    };
  }, [searchParams, state]);

  const rowsPerPage = [10, 20, 30, 40, 50, 100];
  const [perPageValue, setPerPageValue] = useState(
    searchParams.get("perPage") || "100",
  );

  const handlePerPageValueChange = (value: string) => {
    setPerPageValue(value);
    router.push(`${pathName}?page=1&perPage=${value}`);
  };
  const width = open
    ? " md:w-[calc(100%-265px)] md:left-[258px]"
    : "md:w-[calc(100%-60px)] md:left-[52px]";
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
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href={`?page=${Math.min(Number(currentPage) + 1, totalPages)}&perPage=${rows}`}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>

      <div className="hidden flex-col gap-x-2 sm:flex sm:flex-1 sm:items-center sm:justify-between lg:flex-row">
        <div className="flex w-full flex-1 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span>Showing {Math.min(Number(rows), totalRows)}</span> of{" "}
            <span className="font-medium">{totalRows}</span> results
          </p>
          <div className="flex items-center justify-center gap-4">
            <Label className="whitespace-nowrap">Rows Per Page</Label>
            <Select
              onValueChange={handlePerPageValueChange}
              defaultValue={`${perPageValue}` || "10"}
            >
              <SelectTrigger>
                <SelectValue placeholder={`${rows} rows`} />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPage.map((row) => (
                  <SelectItem value={row.toString()} key={row}>
                    {row} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-10 lg:w-auto">
          <Label>
            Page {currentPage} of {totalPages}
          </Label>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md"
          >
            <a
              href={`?page=${Math.min(Number(currentPage) * -5, 1)}&perPage=${rows}`}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronDoubleLeftIcon aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href={`?page=${Math.max(Number(currentPage) - 1, 1)}&perPage=${rows}`}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href={`?page=1&perPage=${rows}`}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              1
            </a>

            <span className="relative mt-1 inline-flex items-center px-4 text-sm font-semibold text-gray-700 focus:outline-offset-0">
              <Menu as="div" className="relative inline-block text-left">
                <MenuItems
                  transition
                  className="absolute bottom-full left-0 z-10 mb-2 w-20 origin-bottom-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <div className="flex max-h-72 flex-col overflow-auto py-1">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <MenuItem key={index + 1}>
                        <a
                          href={`?page=${index + 1}&perPage=${rows}`}
                          className={cn(
                            "block px-4 py-2 text-sm data-[focus]:bg-gray-100",
                          )}
                        >
                          {index + 1}
                        </a>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
                {totalPages > 1 && (
                  <div>
                    <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <EllipsisHorizontalIcon className="h-5 w-5 rounded-full border" />
                    </MenuButton>
                  </div>
                )}
              </Menu>
            </span>
            {totalPages > 1 && (
              <a
                href={`?page=${totalPages}&perPage=${rows}`}
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                {totalPages}
              </a>
            )}

            <a
              href={`?page=${Math.min(Number(currentPage) + 1, totalPages)}&perPage=${rows}`}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>

              <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
            </a>
            <a
              href={`?page=${Math.max(Number(currentPage) * 5, totalPages)}&perPage=${rows}`}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronDoubleRightIcon aria-hidden="true" className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
