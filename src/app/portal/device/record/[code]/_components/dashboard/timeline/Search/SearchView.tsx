'use client'
import {  SearchContext } from "./SearchProvider";
import NetworkFlow from "../../network-traffic-visualization";
import { SearchIcon } from "lucide-react";
import { useContext } from "react";
import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

const SearchView = () => {
  const { state, actions } = useContext(SearchContext);
  console.log("%c Line:11 🌶 state", "color:#2eafb0", state);
  const { filters, query } = state ?? {};
  const { addFilter } = actions ?? {};

  // grid filters = kung mag click kag grid filters mo change ang URL para maka rerender para mo update ang data,
  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col gap-4">
     
      <div className="flex mb-2">
        <div className="h-[36px] justify-between flex gap-x-2">
          {["All Data"]?.map((filter, index) => (
            <span key={index} className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm">
              {filter}
            </span>
          ))}
          <div className="h-[36px] justify-between flex gap-x-2">
          
            <button className="flex min-w-24 items-center justify-between rounded-md bg-tertiary px-3 py-0 pr-1 text-sm">
              +
            </button>
         </div>
        </div>
      </div>
 <div className="flex md:flex-wrap lg:flex-nowrap items-center md:gap-2 self-end rounded-md border px-2 ps-3 focus-within:border-primary w-full max-w-[400px]">
        {/* <input
          type="text"
          value="Hellow"
          className="flex-grow border-none px-1.5 md:px-3 h-[35px] bg-transparent outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
          placeholder="Search"
          onChange={() => { console.log("Hello I'm Here!!!") }}
        />
        <button
          className='my-auto'
          >
          <SearchIcon className="size-4"/>
        </button> */}
        <Combobox>
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-2 top-2.5 size-5 text-gray-400"
                  aria-hidden="true"
                />
                <ComboboxInput
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className="h-10 w-full border-0 bg-transparent pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search..."
                  value={query}
                  onChange={(event) => {
                    actions?.handleOnChange(event.target.value);
                  }}
                  // onBlur={() => {
                  //   actions?.handleOpen(false);
                  // }}
                  // onFocus={() => {
                  //   actions?.handleOpen(true);
                  // }}
                />
              </div>

              {/* {state?.open && !!debouncedSearchInput && ( */}
                <ComboboxOptions
                  static
                  as="ul"
                  className="max-h-80 scroll-py-2 divide-y divide-gray-100 overflow-y-auto"
                >
                  {/* <li className="p-2">
                    <h2 className="mb-2 mt-1 px-3 text-xs font-semibold text-gray-500">
                      <SearchResult
                        results={
                          (transformSearchData(
                            items, debouncedSearchInput, searchableFields,
                          ) as ISearchItemResult[]) || null
                        }
                        closeDialog={handleCloseDialog}
                      />
                    </h2>
                  </li> */}
                </ComboboxOptions>
              {/* )} */}
            </Combobox>
           
      </div>
      {/* <Card> */}
          <NetworkFlow/>
      {/* </Card> */}
    </div>
  );
};

export default SearchView