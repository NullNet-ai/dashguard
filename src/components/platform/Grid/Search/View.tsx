"use client";

import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useDebounce } from "~/components/ui/multi-select";
// import RecentSearch from "./RecentSearch";
import { useContext } from "react";
import { SearchGridContext } from "./Provider";
import { GridContext } from "../Provider";
import SearchResult from "./SearchResult";
import { cn, formatAndCapitalize } from "~/lib/utils";
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
    entity = "",
    searchConfig,
  } = gridState?.config ?? {};
  const { advanceFilterItems = [] } = state ?? {};
  const { query = "", searchItems = [] } = state ?? {};
  const { handleSearchQuery } = actions ?? {};

  const debouncedSearchInput = useDebounce(query, 500);

  const data = handleSearchQuery!(
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
      ...(searchConfig?.query_params ?? {}),
    },
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: debouncedSearchInput?.length > 3,
    },
  );

  const { items } = data ?? {};

  // Filter and log search items to debug any unintended data
  const selectedSearchItems = searchItems?.filter((item) => !item?.default);
  const defaultSearchItems = searchItems?.filter((item) => item?.default);

  return (
    <>
      <Combobox>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 rounded-md border px-2 ps-3 focus-within:border-primary">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            {selectedSearchItems.length > 0 && (
              <div className="flex flex-wrap gap-1 py-1">
                {selectedSearchItems?.map((item, index) => {
                  if (item.type === "operator" && index === 0) {
                    return null;
                  }
                  return (
                    <Badge
                      key={item.id}
                      variant="primary"
                      className="m-1 flex items-center gap-1"
                    >
                      {item.type === "criteria"
                        ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is ${item?.display_value ? item?.display_value : item?.values?.[0]}`
                        : item?.operator}
                      {item.type === "criteria" && !item.default && (
                        <Button
                          variant="ghost"
                          size="xs"
                          name="removeSortingButton"
                          key={`${item.id}-remove`}
                          className="h-auto w-auto p-0 text-primary hover:bg-transparent focus:outline-none"
                          onClick={() => {
                            actions?.handleRemoveSearchItem(item);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            )}
            <ComboboxInput
              className="flex-grow border-none bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
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
          </div>
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
      <div
        className={cn(
          `${!gridState?.sorting?.length ? "mt-[20px]" : "absolute -bottom-[50px]"}`,
        )}
      >
        <span className="text-xs text-black">Filtered By: </span>
        {defaultSearchItems?.map((item) => (
          <Badge key={item.id} variant="primary" className="m-2 mx-1">
            {item.type === "criteria"
              ? `${item?.label || formatAndCapitalize(item?.field ?? "")} is ${item?.display_value || item?.values?.[0]}`
              : item?.operator}
          </Badge>
        ))}
      </div>
    </>
  );
}
