import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Fragment, useCallback, useRef, useState } from "react";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { useDebounce } from "../../ui/multi-select";
import { api } from "~/trpc/react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { type IField } from "../FormBuilder/type";
import { formatFormTestID } from "~/lib/utils";

interface CommonProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  formKey: string;
  handleSelectAddress: (address: {
    name: string;
    description: string;
    place_id: string;
    id: string;
    provider: string;
  }) => void;
}

export function AddressAutoCompleteInput(props: CommonProps) {
  const { handleSelectAddress, form,formKey } = props;
  const googleAutoComplete = api.google.searchPlace.useMutation();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const [searchedAddress, setSearchedAddress] = useState("");
  const handleSearch = (search: string) => {
    setSearchedAddress(search);
    form.setValue("searchedAddress", search);
  };

  const debouncedSearchInput = useDebounce(searchedAddress, 500);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fetchData = async () => {
    const response = await googleAutoComplete.mutateAsync({
      query: searchedAddress,
    });
    return response?.data;
  };

  const { data: predictions, isLoading } = useQuery({
    queryKey: ["sample", debouncedSearchInput],
    queryFn: fetchData,
    refetchOnWindowFocus: false,
    gcTime: 0,
    enabled: debouncedSearchInput !== "",
  });
  return (
    <FormField
      control={form.control}
      name="inp-addr"
      render={(formRenderProps) => {
        return (
          <FormItem>
            <FormLabel data-test-id={formKey   + "-"+ "lbl-" + formRenderProps.field.name }>
              Address
            </FormLabel>
            <FormControl>
              <Combobox>
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-2.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />

                  <ComboboxInput
                    {...formRenderProps?.field}
                    data-test-id={formKey   + "-" + formRenderProps.field.name}
                    ref={inputRef}
                    className="h-10 w-full rounded-md border border-gray-200 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border sm:text-sm"
                    placeholder="Search..."
                    onChange={(event) => {
                      handleSearch(event.target.value);
                    }}
                    onBlur={close}
                    onFocus={open}
                  />
                  {isOpen && (
                    <ComboboxOptions
                      static
                      as="ul"
                      className="absolute z-[100] mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                    >
                      {isOpen && (
                        <div className="flex flex-row items-center">
                          <h2 className="mb-2 mt-2 px-3 text-xs font-semibold text-gray-500">
                            Search Address{" "}
                          </h2>
                          {isLoading && (
                            <Loader2 className="size-5 animate-spin" />
                          )}
                        </div>
                      )}
                      <li className="p-2">
                        <Fragment>
                          <ul className="text-sm text-gray-700">
                            {predictions?.length ? (
                              <Fragment>
                                {predictions?.map((place, index) => (
                                  <Fragment key={place.place_id + index}>
                                    <ComboboxOption
                                      onClick={() => {
                                        handleSearch("");
                                        handleSelectAddress(place);
                                        inputRef.current?.blur();
                                      }}
                                      as="li"
                                      data-test-id={formKey   + formRenderProps.field.name + "-opt-" + formatFormTestID(place?.name)}
                                      value={place?.name}
                                      className="group flex cursor-default select-none items-center rounded-md px-3 py-2 hover:bg-indigo-500 hover:text-white"
                                    >
                                      <div className="flex flex-row">
                                        <MapPinIcon className="h-5 w-5 text-sky-500" />
                                        <span className="ml-3 flex-auto truncate">
                                          {place.name}
                                        </span>
                                      </div>
                                    </ComboboxOption>
                                  </Fragment>
                                ))}
                              </Fragment>
                            ) : null}
                          </ul>
                        </Fragment>
                      </li>
                    </ComboboxOptions>
                  )}
                </div>
              </Combobox>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
