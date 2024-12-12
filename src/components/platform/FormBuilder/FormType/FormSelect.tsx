import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField, type ISelectOptions } from "../type";
import {
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Badge } from "~/components/ui/badge";
import React, { useMemo, useState } from "react";
import { cn } from "~/lib/utils";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  selectOptions: Record<string, ISelectOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  pillOptions?: any[];
}

export default function FormSelect({
  fieldConfig,
  formRenderProps,
  selectOptions,
  pillOptions,
  form,
}: IProps) {
  const { error } = useFormField();
  const [query, setQuery] = useState("");
  form.watch();
  const filteredOptions = useMemo(() => {
    return query === ""
      ? selectOptions?.[fieldConfig?.name]
          // Sort by label
          ?.sort((a, b) => a.label.localeCompare(b.label))
          ?.slice(0, 250)
      : selectOptions?.[fieldConfig?.name]
          ?.filter((opt) => {
            return opt.value.toLowerCase().includes(query.toLowerCase());
          })
          ?.sort((a, b) => a.label.localeCompare(b.label))
          .slice(0, 5);
  }, [query, selectOptions?.[fieldConfig?.name]]);
  const label = useMemo(() => {
    return filteredOptions?.find(
      (opt) => opt.value === formRenderProps?.field.value,
    );
  }, [formRenderProps?.field.value]);
  return (
    <FormItem>
      <div>
        <FormLabel required={fieldConfig?.required}>
          {fieldConfig?.label}
        </FormLabel>
        {!!pillOptions?.length ? (
          <>
            {pillOptions.map((option, index) => (
              <Badge
                key={index}
                className="mx-2 border border-green-800 bg-green-50 text-green-800"
              >
                {option}
              </Badge>
            ))}
          </>
        ) : null}
      </div>
      <Combobox
        as="div"
        value={
          label || {
            label: fieldConfig?.placeholder,
            value: "",
          }
        }
        onChange={(value) => {
          setQuery("");
          formRenderProps?.field.onChange(value?.value);
        }}
        disabled={fieldConfig?.disabled}
      >
        <div className="relative mt-2">
          <ComboboxButton
            disabled={formRenderProps?.field?.disabled}
            className="inset-y-0 right-0 flex w-full items-center rounded-r-md focus:outline-none"
          >
            <ComboboxInput
              readOnly={
                fieldConfig?.selectSearchable
                  ? !fieldConfig?.selectSearchable
                  : true
              }
              className={cn(
                "block w-full rounded-md bg-white py-1.5 pl-3 pr-12 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6",
                {
                  "outline-red-500": error,
                },
              )}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => setQuery("")}
              // @ts-expect-error - Type 'string' is not assignable to type 'undefined'.
              displayValue={(value) => value?.label}
            />
            <ChevronUpDownIcon
              className="absolute right-4 size-5 text-gray-400"
              aria-hidden="true"
            />
          </ComboboxButton>

          {filteredOptions?.length ? (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {filteredOptions?.map((opt) => (
                <ComboboxOption
                  key={opt?.value}
                  value={opt}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                >
                  <span className="block truncate group-data-[selected]:font-semibold">
                    {opt.label}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="size-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          ) : (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              <div className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none">
                <span className="block truncate group-data-[selected]:font-semibold">
                  No {fieldConfig?.label} found.
                </span>
              </div>
            </div>
          )}
        </div>
      </Combobox>
      <FormMessage />
    </FormItem>
  );
}
