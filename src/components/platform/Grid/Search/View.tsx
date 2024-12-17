"use client";

import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

import RecentSearch from "./RecentSearch";
import { useContext } from "react";
import { SearchGridContext } from "./Provider";
import { GridContext } from "../Provider";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";

export default function Search() {
  const { state, actions } = useContext(SearchGridContext);
  const gridContext = useContext(GridContext);




  return (
    <Combobox>
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-4 top-2.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />

        <ComboboxInput
          data-test-id={testIDFormatter(`${gridContext?.state?.config?.entity}-grd-search-inp`)}
          className="h-10 w-full rounded-md border bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border sm:text-sm"
          placeholder="Search..."
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
        {state?.open && (
          <ComboboxOptions
            static
            as="ul"
            className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
          >
            <li className="p-2">
              <RecentSearch entity={gridContext?.state?.config?.entity} projects={state?.recentView || []} />
            </li>
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
