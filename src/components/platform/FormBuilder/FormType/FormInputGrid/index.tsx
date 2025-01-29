import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import { Loader2 } from "lucide-react";
import { Fragment, useCallback, useState } from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useDebounce } from "~/components/ui/multi-select";
import { api } from "~/trpc/react";
import { type IField } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormInputGrid({
  fieldConfig,
  formRenderProps,
  value,
  form,
  formKey,
}: IProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const [filterField, setFilterField] = useState("");
  const handleSearch = (filter: string) => {
    setFilterField(filter);
    form.setValue(fieldConfig?.name, filter);
  };

  const debouncedSearchInput = useDebounce(filterField, 500);

  const { data, isLoading } = api.grid.items.useQuery(
    {
      entity: "contact",
      current: 0,
      limit: 100,
      pluck: ["id", "code"],
    },
    {
      refetchOnWindowFocus: false,
      gcTime: 0,
      enabled: debouncedSearchInput !== "",
    },
  );
  const { items: predictions } = data ?? {};
  return (
    <>
      <FormItem>
        <FormLabel
          required={fieldConfig?.required}
          data-test-id={formKey + "-inp-grd-label-" + fieldConfig.name}
        ></FormLabel>
        {fieldConfig?.label}
        <FormControl>
          <Combobox>
            <div className="relative">
              <ComboboxInput
                {...formRenderProps?.field}
                disabled={fieldConfig.disabled}
                 readOnly={(formRenderProps.field.disabled || fieldConfig?.readonly) ?? false}
                autoComplete="off"
                data-test-id={
                  formKey + "-inp-grd-input-" + fieldConfig.name
                }
                className="h-10 focus:border-primary focus:ring-primary rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground focus:border sm:text-xs"
                placeholder={fieldConfig?.placeholder || fieldConfig?.label}
                onChange={(event) => {
                  handleSearch(event.target.value);
                }}
                value={value}
                onBlur={close}
                onFocus={open}
              />
              {isOpen && (
                <ComboboxOptions
                  static
                  as="ul"
                  data-test-id={
                    formKey + "-inp-grd-opts-" + fieldConfig.name
                  }
                  className="absolute z-[100] mt-1 max-h-80 w-[700px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <li className="p-2">
                    <>
                      {!!predictions?.length ? null : (
                        <div className="flex flex-row items-center">
                          {isLoading && (
                            <Loader2 className="size-5 animate-spin" />
                          )}
                        </div>
                      )}
                      <ul className="text-xs text-gray-700">
                        <Fragment>
                          <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
                                  <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th
                                          scope="col"
                                          className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6"
                                        >
                                          Name
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900"
                                        >
                                          Title
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900"
                                        >
                                          Email
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-2.5 text-left text-xs font-semibold text-gray-900"
                                        >
                                          Role
                                        </th>
                                        <th
                                          scope="col"
                                          className="relative py-2.5 pl-3 pr-4 sm:pr-6"
                                        >
                                          <span className="sr-only">Edit</span>
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                      {predictions?.map((filtered, indx) => (
                                        <tr key={indx}>
                                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6">
                                            {"filtered"}
                                          </td>
                                          <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-500">
                                            {" "}
                                            {"filtered"}
                                          </td>
                                          <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-500">
                                            {" "}
                                            {"filtered"}
                                          </td>

                                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-xs font-medium sm:pr-6">
                                            <a
                                              href="#"
                                              className="text-indigo-600 hover:text-indigo-900"
                                            >
                                              Edit
                                              <span className="sr-only">
                                                , "Test"
                                              </span>
                                            </a>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      </ul>
                    </>
                  </li>
                </ComboboxOptions>
              )}
            </div>
          </Combobox>
        </FormControl>
        <FormMessage
          data-test-id={
            formKey + "-inp-grd-err-msg-" + fieldConfig.name
          }
        />
      </FormItem>
    </>
  );
}
