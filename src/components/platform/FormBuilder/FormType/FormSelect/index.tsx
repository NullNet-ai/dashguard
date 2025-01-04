import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField, type ISelectOptions } from "../../types";
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
import { usePopper } from "react-popper";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Badge } from "~/components/ui/badge";
import React, { useMemo, useState } from "react";
import { cn, formatFormTestID } from "~/lib/utils";
import { ChevronDownIcon } from "lucide-react";

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
  const { error } = useFormField();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const isDisabled = fieldConfig.disabled || formRenderProps.field.disabled;
  const isReadOnly = fieldConfig.readonly;

  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start", // Default placement
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "viewport",
        },
      },
      {
        name: "flip",
        options: {
          fallbackPlacements: ["top-start"],
        },
      },
    ],
  });

  const SelectIcon = fieldConfig.selectIcon;
  const filteredOptions = useMemo(() => {
    return query === ""
      ? selectOptions?.[fieldConfig?.name]
          ?.sort((a, b) => a.label.localeCompare(b.label))
          ?.slice(0, 250)
          ?.filter((opt) => {
            return !!opt?.label;
          })
      : selectOptions?.[fieldConfig?.name]
          ?.filter((opt) => {
            return opt.value.toLowerCase().includes(query.toLowerCase());
          })
          ?.sort((a, b) => a.label.localeCompare(b.label))
          .slice(0, 5)
          ?.filter((opt) => {
            return !!opt?.label;
          });
  }, [fieldConfig?.name, query, selectOptions]);

  const label = useMemo(() => {
    return selectOptions?.[fieldConfig?.name]?.find(
      (opt) => opt.value === formRenderProps?.field.value,
    );
  }, [formRenderProps?.field.value]);

  const inputReadOnly = useMemo(() => {
    return !fieldConfig?.selectSearchable || isReadOnly || isDisabled;
  }, [fieldConfig?.selectSearchable, isReadOnly, isDisabled]);

  return (
    <FormItem>
      <div>
        <FormLabel
          required={fieldConfig?.required}
          data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
        >
          {fieldConfig?.label}
        </FormLabel>
        {!!pillOptions?.length ? (
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
            label: "",
            value: "",
          }
        }
        onChange={(value) => {
          setTimeout(() => setOpen(false), 100);
          setQuery("");
          formRenderProps?.field.onChange(value?.value || "");
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
              "block w-full rounded-md border-border  focus:border-primary focus:ring-primary py-1.5 pl-8 pr-12 text-base text-foreground placeholder:text-muted-foreground sm:text-sm/6",
              {
                "outline-destructive": error,
                "border-destructive": error,
                "cursor-not-allowed": isDisabled,
                "cursor-text": isReadOnly,
              },
            )}
            onClick={() => {
              if (isDisabled || isReadOnly) return;
              setOpen(true);
            }}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 100);
              setQuery("");
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
                "cursor-not-allowed": isDisabled,
                "cursor-default": isReadOnly,
              },
            )}
            data-test-id={`${formKey}-btn-${fieldConfig.name}`}
          >
            <ChevronDownIcon
              className={cn("absolute right-2 top-2.5 size-5 text-muted-foreground", {
                "opacity-50": isDisabled || isReadOnly,
              })}
              aria-hidden="true"
            />
          </ComboboxButton>
          {!(isDisabled || isReadOnly) &&
            (filteredOptions?.length ? (
              <ComboboxOptions
                static={open}
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                data-test-id={`${formKey}-opts-${fieldConfig.name}`}
              >
                {filteredOptions?.slice(0, 700).map((opt) => (
                  <ComboboxOption
                    key={opt?.value}
                    value={opt}
                    disabled={isDisabled || isReadOnly}
                    className={cn(
                      "group relative cursor-default select-none py-2 pl-3 pr-9 text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none",
                      {
                        "cursor-not-allowed": isDisabled,
                        "cursor-default": isReadOnly,
                      },
                    )}
                    data-test-id={`${formKey}-opt-${formatFormTestID(opt.value)}-${fieldConfig.name}`}
                  >
                    <span
                      className="block truncate group-data-[selected]:font-semibold"
                      data-test-id={`${formKey}-opt-${formatFormTestID(opt.value)}-lbl-${fieldConfig.name}`}
                    >
                      {opt.label}
                    </span>

                    <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-primary group-data-[selected]:flex group-data-[focus]:text-white">
                      <CheckIcon className="size-5" aria-hidden="true" />
                    </span>
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            ) : (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-md">
                <div className="group relative cursor-default select-none py-2 pl-3 pr-9 text-foreground data-[focus]:bg-primary data-[focus]:text-white data-[focus]:outline-none">
                  <span
                    className="block truncate group-data-[selected]:font-semibold"
                    data-test-id={`${formKey}-opt-not-found-${fieldConfig.name}`}
                  >
                    No {fieldConfig?.label} found.
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Combobox>

      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
