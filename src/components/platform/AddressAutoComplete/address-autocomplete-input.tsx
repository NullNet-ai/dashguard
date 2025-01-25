import { useQuery } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";
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
import { Button } from "~/components/ui/button";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { type IField } from "../FormBuilder/types";
import { formatFormTestID } from "~/lib/utils";

interface ExtendedControllerRenderProps
  extends ControllerRenderProps<Record<string, any>, string> {
  accuracy?: number;
}
interface CommonProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig: IField;
  formRenderProps: {
    field: ExtendedControllerRenderProps;
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
  const { handleSelectAddress, form, formKey, fieldConfig, formRenderProps } =
    props;
  const googleAutoComplete = api.google.searchPlace.useMutation();
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const [searchedAddress, setSearchedAddress] = useState("");
  const handleSearch = (search: string) => {
    setSearchedAddress(search);
    form.setValue("searchedAddress", search);
  };

  const debouncedSearchInput = useDebounce(searchedAddress, 200);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fetchData = async () => {
    const response = await googleAutoComplete.mutateAsync({
      query: searchedAddress,
      accuracy: fieldConfig?.accuracy,
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
        const is_readonly =
        !!(formRenderProps.field.disabled || fieldConfig?.readonly)
        const is_disabled = fieldConfig?.disabled;
        const is_disabled_or_readonly = is_disabled || is_readonly;
        return (
          <FormItem>
            <FormLabel
              required={fieldConfig?.required}
              data-test-id={formKey + "-" + "lbl-" + formRenderProps.field.name}
            >
              Address
            </FormLabel>
            <FormControl>
              <Combobox>
                <div className="relative flex gap-2">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute left-4 top-2.5 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <ComboboxInput
                    {...formRenderProps.field}
                    {...fieldConfig}
                    ref={inputRef}
                    disabled={is_disabled}
                    readOnly={is_readonly}
                    data-test-id={formKey + "-" + formRenderProps?.field.name}
                    autoComplete="off"
                    className="relative h-[36px] w-full flex-grow rounded-md border border-border bg-transparent pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border focus:border-primary focus:ring-primary text-md disabled:bg-secondary  disabled:text-gray-400 disabled:border-gray-300"
                    placeholder="Search..."
                    onFocus={open}
                    onChange={(event) => {
                      handleSearch(event.target.value);
                    }}
                    value={searchedAddress}
                    onBlur={close}
                  />
                  <Button
                    className="gap-1 h-[36px]"
                    variant={"outline"}
                    onClick={() => {
                      const values = form.getValues();
                      form.reset({
                        ...values,
                        searchedAddress: "",
                        details: {},
                      });
                      handleSearch("");
                    }}
                    disabled={is_disabled_or_readonly}
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={3} />
                    Reset
                  </Button>
                  {isOpen && !is_disabled_or_readonly && (
                    <ComboboxOptions
                      static
                      as="ul"
                      className="absolute z-[100] mt-12 max-h-80 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg"
                    >
                      {isOpen && (
                        <div className="flex flex-row items-center">
                          <h2 className="mb-2 mt-2 px-3 text-xs font-semibold text-muted-foreground">
                            Search Address{" "}
                          </h2>
                          {isLoading && (
                            <Loader2 className="size-5 animate-spin" />
                          )}
                        </div>
                      )}
                      <li className="p-2">
                        <Fragment>
                          <ul className="text-md">
                            {predictions?.length ? (
                              <Fragment>
                                {predictions?.map((place, index) => (
                                  <Fragment key={place.place_id + index}>
                                    <ComboboxOption
                                      onClick={() => {
                                        // handleSearch("");
                                        handleSelectAddress(place);
                                        inputRef.current?.blur();
                                      }}
                                      as="li"
                                      data-test-id={
                                        formKey +
                                        formRenderProps.field.name +
                                        "-opt-" +
                                        formatFormTestID(place?.name)
                                      }
                                      value={place?.name}
                                      className="group flex cursor-default select-none items-center rounded-md px-3 py-2 hover:bg-primary/90 hover:text-white"
                                    >
                                      <div className="flex flex-row">
                                        <MapPinIcon className="h-5 w-5 hover:text-primary-foreground shrink-0" />
                                        <span className="ml-3 flex-auto ">
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