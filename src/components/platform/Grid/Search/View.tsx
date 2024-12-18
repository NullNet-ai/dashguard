"use client";

import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useDebounce } from "~/components/ui/multi-select";
import RecentSearch from "./RecentSearch";
import { useContext } from "react";
import { SearchGridContext } from "./Provider";
import { GridContext } from "../Provider";
import SearchResult from "./SearchResult";
import { formatAndCapitalize } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";
import { ISearchItemResult } from "./types";
import { transformSearchData } from "./utils/transformSearchData";

export default function Search() {
  const { state, actions } = useContext(SearchGridContext);
  const { state: gridState } = useContext(GridContext);
  const {
    searchableFields = [],
    searchCustomQuery,
    entity = "",
  } = gridState?.config ?? {};
  const { advanceFilterItems = [] } = state ?? {};

  const { query = "", searchItems = [] } = state ?? {};

  const { defaultHandleFilterQuery } = actions ?? {};

  const debouncedSearchInput = useDebounce(query, 500);

  const onFieldFilterFn = defaultHandleFilterQuery!;

  const data = onFieldFilterFn!(
    {
      entity,
      current: 0,
      limit: 100,
      pluck: [
        "id",
        "code",
        "categories",
        "organization_id",
        "first_name",
        "middle_name",
        "last_name",
        "email_address",
        "contact_status",
        "status",
        "created_date",
        "updated_date",
        "created_time",
        "updated_time",
      ],
      advance_filters: advanceFilterItems,
    },
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: debouncedSearchInput?.length > 3,
    },
  );
  const { items } = data ?? {};

  const defaultSearchItems = searchItems?.filter((item) => item?.default);
  const selectedSearchItems = searchItems?.filter((item) => !item?.default);


  return (
    <>
      <Combobox>
        {selectedSearchItems.length > 0 && (
          <>
            {selectedSearchItems?.map((item, index) => {
              if (item.type === "operator" && index === 0) {
                return <></>;
              }
              return (
                <Badge key={item.id} variant="primary">
                  {item.type === "criteria"
                    ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is ${item?.values?.[0]}`
                    : item?.operator}
                  {item.type === "criteria" && !item.default && (
                    <Button
                      variant="ghost"
                      size="xs"
                      name="removeSortingButton"
                      key={`${item.id}-remove`}
                      className="h-auto w-auto p-0 focus:outline-none"
                      onClick={() => {
                        actions?.handleRemoveSearchItem(item);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </Badge>
              );
            })}
          </>
        )}
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-4 top-2.5 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />

          <ComboboxInput
            className="h-10 w-full rounded-md border bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border sm:text-sm"
            placeholder="Search..."
            value={query}
            onChange={(event) => {
              actions?.handleQuery(event.target.value);
            }}
            onBlur={() => {
              actions?.handleOpen(false);
            }}
            onFocus={() => {
              actions?.handleOpen(true);
            }}
          />
          {state?.open && debouncedSearchInput.length > 3 && (
            <ComboboxOptions
              static
              as="ul"
              className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
            >
              <li className="p-2">
                <SearchResult
                  results={
                    (transformSearchData(
                      items,
                      debouncedSearchInput,
                      searchableFields,
                    ) as ISearchItemResult[]) || null
                  }
                />
              </li>
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
      <div>
        <span className="text-xs text-black">Filtered By: </span>
        {defaultSearchItems?.map((item) => (
          <Badge key={item.id} variant="primary">
            {item.type === "criteria"
              ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is ${item?.values?.[0]}`
              : item?.operator}
          </Badge>
        ))}
      </div>
    </>
  );
}
