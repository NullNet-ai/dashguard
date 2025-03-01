import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { usePopper } from "react-popper";

import { Badge } from "~/components/ui/badge";
import {
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import { useToast } from "~/context/ToastProvider";
import { cn, formatFormTestID } from "~/lib/utils";

import { createRecord } from "../../Actions/CreateRecord";
import { type IField, type ISelectOptions } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  selectOptions: Record<string, ISelectOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  pillOptions?: any[];
  formKey: string;
}

export default function FormSelect({
  fieldConfig,
  formRenderProps,
  selectOptions,
  pillOptions,
  formKey,
  form,
}: IProps) {
  form.watch(fieldConfig?.name);
  const toast = useToast();
  const { error } = useFormField();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const isDisabled = fieldConfig.disabled ?? false;
  const isReadOnly = fieldConfig.isCustomFormField
    ? fieldConfig.readonly
    : formRenderProps.field.disabled || fieldConfig.readonly;

  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const [options, setOptions] = useState<ISelectOptions[]>(
    selectOptions?.[fieldConfig?.name] ?? [],
  );
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "viewport",
          boundary: "clippingParents",
          padding: 8,
        },
      },
      {
        name: "flip",
        options: {
          fallbackPlacements: ["top", "right", "left"],  // Expanded fallback placements
          padding: 8,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 0],
        },
      },
      {
        name: "computeStyles",
        options: {
          gpuAcceleration: true,
        },
      },
    ],
  });

  // Add popper position update when opening
  useEffect(() => {
    if (open && update) {
      setTimeout(() => {
        update();
      }, 0);
    }
  }, [open, update]);

  const SelectIcon = fieldConfig.selectIcon;

  // Helper function to check if a string is numeric
  // Helper function to sort options
  const sortOptions = useCallback((opts: ISelectOptions[]) => {
    const isNumeric = (str: string) => {
      if (typeof str !== "string") return false;
      return !isNaN(parseFloat(str)) && isFinite(Number(str));
    };

    return [...opts].sort((a, b) => {
      // Check if both values are numeric strings
      if (isNumeric(a.value) && isNumeric(b.value)) {
        return Number(a.value) - Number(b.value);
      }
      // Fall back to alphabetical sorting if not numeric
      return a.label?.localeCompare(b.label) ?? 0;
    });
  }, []);

  const filteredOptions = useMemo(() => {
    const filtered =
      query === ""
        ? options?.filter((opt) => !!opt?.label)?.slice(0, 250)
        : options
          ?.filter((opt) => {
            return opt.label.toLowerCase().includes(query.toLowerCase()?.trim());
          })
          ?.slice(0, 5)
          ?.filter((opt) => !!opt?.label);

    return sortOptions(filtered ?? []);
  }, [query, options, sortOptions]);

  React.useEffect(() => {
    setOptions(selectOptions?.[fieldConfig?.name] ?? []);
  }, [selectOptions, fieldConfig?.name]);

  const label = useMemo(() => {
    return options?.find((opt) => opt.value === formRenderProps?.field.value);
  }, [formRenderProps?.field.value, options]);

  const inputReadOnly = useMemo(() => {
    return (
      (!fieldConfig?.selectSearchable && !fieldConfig?.selectEnableCreate) ||
      isReadOnly ||
      isDisabled
    );
  }, [
    fieldConfig?.selectSearchable,
    isReadOnly,
    isDisabled,
    fieldConfig?.selectEnableCreate,
  ]);

  const createNewRecord = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!fieldConfig?.selectOnCreateRecord) {
      toast.error("selectOnCreateRecord is not defined in fieldConfig");
      return;
    }
    if (fieldConfig?.selectOnCreateValidate) {
      const validation = await fieldConfig?.selectOnCreateValidate(query);
      if (!validation?.valid) {
        toast.error(validation?.message || "Invalid Input");
        return;
      }
    }
    setIsCreateLoading(true);
    let createdData = null;
    if (typeof fieldConfig?.selectOnCreateRecord === "function") {
      createdData = await fieldConfig?.selectOnCreateRecord(query);
    } else {
      const { entity, fieldIdentifier, customParams } =
        fieldConfig?.selectOnCreateRecord ?? {};
      createdData = (await createRecord({
        entity,
        fieldIdentifier,
        data: {
          ...(customParams ?? {}),
          [fieldIdentifier]: query,
        },
      })) as ISelectOptions;
    }
    setOptions(sortOptions([...(options ?? []), createdData]));
    formRenderProps?.field.onChange(createdData?.value || "");
    setIsCreateLoading(false);
    setTimeout(() => setOpen(false), 100);
  };

  const isOptionsExist = options?.find(p => p.label === query?.trim());

  return (
    <FormItem className={fieldConfig?.selectContainerClassName}>
      <div >
        <FormLabel
          required={fieldConfig?.required}
          data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
        >
          {fieldConfig?.label}
        </FormLabel>
        {pillOptions?.length ? (
          <>
            {pillOptions.map((option, index) => (
              <Badge
                data-test-id={`${formKey}-opt-${option}-${fieldConfig.name}`}
                key={index}
                className="mx-2 border border-success bg-success/10 text-success"
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
            label: query,
            value: "",
          }
        }
        onChange={(value) => {
          setTimeout(() => setOpen(false), 100);
          setQuery("");
          formRenderProps?.field?.onChange(value?.value || "");
        }}
        disabled={isDisabled}
      >
        <div className="relative mt-2">
          {SelectIcon && (
            <SelectIcon
              className={cn(
                "absolute left-2 top-2.5 size-5 text-muted-foreground",
                {
                  "opacity-50": isDisabled,
                },
              )}
              aria-hidden="true"
            />
          )}
          <ComboboxInput
            placeholder={fieldConfig.placeholder}
            readOnly={inputReadOnly}
            disabled={isDisabled}
            ref={setReferenceElement}
            className={cn(
              "block w-full rounded-md border-border py-[5px] text-md pl-8 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary disabled:border-gray-300 disabled:bg-secondary disabled:text-gray-400 sm:text-sm/6",
              {
                "outline-destructive": error,
                "border-destructive": error,
                "cursor-text": isReadOnly,
              },
              SelectIcon ? "pl-8" : "pl-2",
            )}
            onClick={() => {
              if (isDisabled || isReadOnly) return;
              setOpen(true);
            }}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 100);
            }}
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            // @ts-expect-error - Type 'string' is not assignable to type 'undefined'.
            displayValue={(value) => value?.label}
          />
          <ComboboxButton
            disabled={isDisabled}
            className={cn(
              "inset-y-0 right-0 flex w-full items-center rounded-r-md focus:outline-none",
              {
                "cursor-default": isReadOnly,
              },
            )}
            data-test-id={`${formKey}-btn-${fieldConfig.name}`}
          >
            <ChevronDownIcon
              className={cn(
                "absolute right-2 top-2.5 size-5 text-muted-foreground",
                {
                  "opacity-50": isDisabled || isReadOnly,
                },
              )}
              aria-hidden="true"
            />
          </ComboboxButton>
          {!(isDisabled || isReadOnly) && (
            <ComboboxOptions
              static={open}
              ref={setPopperElement}
              style={{
                ...styles.popper,
                width: referenceElement?.offsetWidth,
              }}
              {...attributes.popper}
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              data-test-id={`${formKey}-opts-${fieldConfig.name}`}
              portal={true}
            >
              {filteredOptions?.slice(0, 700).map((opt) => (
                <ComboboxOption
                  key={opt?.value}
                  value={opt}
                  disabled={isDisabled || isReadOnly}
                  className={cn(
                    "group relative cursor-default select-none py-2 pr-12 text-md text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none",
                    SelectIcon ? "pl-8" : "pl-2",
                    {
                      "cursor-not-allowed": isDisabled,
                      "cursor-default": isReadOnly,
                    },
                  )}
                  data-test-id={`${formKey}-opt-${formatFormTestID(opt.value)}-${fieldConfig.name}`}
                >
                  <span
                    className="block truncate"
                    data-test-id={`${formKey}-opt-${formatFormTestID(opt.value)}-lbl-${fieldConfig.name}`}
                  >
                    {opt.label}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-primary group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="size-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
              {fieldConfig?.selectEnableCreate
                ? !isOptionsExist &&
                query && (
                  <button
                    className="block cursor-pointer truncate bg-primary/10 px-3 py-2 font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    data-test-id={`${formKey}-opt-create-new-${fieldConfig.name}`}
                    onClick={createNewRecord}
                  >
                    {isCreateLoading ? "Creating..." : `Create "${query}"`}
                  </button>
                )
                : !filteredOptions.length && (
                  <span
                    className="ms-3 block truncate group-data-[selected]:font-semibold"
                    data-test-id={`${formKey}-opt-not-found-${fieldConfig.name}`}
                  >
                    {"No "} {fieldConfig?.label} found.
                  </span>
                )}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>

      <FormMessage className='text-md' data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
