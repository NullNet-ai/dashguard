import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField, type ISelectOptions } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { Badge } from "~/components/ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { Fragment, useMemo } from "react";

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
  form.watch(fieldConfig?.name);

  const selectedOption = useMemo(() => {
    return selectOptions?.[fieldConfig?.name]?.find(
      (option) => option.value === formRenderProps?.field.value,
    )?.label;
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

      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-[250px] justify-between",
                !formRenderProps?.field.value && "text-muted-foreground",
              )}
            >
              {selectedOption ? selectedOption : `Select ${fieldConfig?.label}`}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput
              placeholder={`Select ${fieldConfig?.label}`}
              className="my-1 h-8"
            />
            <CommandList>
              <CommandEmpty>No {fieldConfig?.label} found.</CommandEmpty>
              <CommandGroup>
                {selectOptions?.[fieldConfig?.name]
                  ?.slice(0, 999) // Temporary fix for large data
                  .map((option, index) => (
                    <Fragment key={option.value + index}>
                      <CommandItem
                        value={option.value}
                        onSelect={(currentValue) => {
                          formRenderProps?.field.onChange(currentValue);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            formRenderProps?.field.value === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    </Fragment>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* <Select
        {...register(fieldConfig.name)}
        disabled={formRenderProps?.field.disabled || fieldConfig?.disabled}
        onValueChange={formRenderProps?.field.onChange}
        value={formRenderProps?.field.value ?? undefined}
        defaultValue={formRenderProps?.field.value ?? undefined}
      >
        <FormControl>
          <SelectTrigger
            data-test-id={fieldConfig?.name}
            className={
              !!formRenderProps?.fieldState.error ? "border-destructive" : ""
            }
          >
            <SelectValue placeholder={fieldConfig?.placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent data-test-id={fieldConfig?.name + "Options"}>
          {selectOptions?.[fieldConfig?.name]?.map((option, index) => (
            <SelectItem
              key={option.value}
              value={option.value}
              data-test-id={(fieldConfig.name + option.label)
                .split(" ")
                .join("")}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
      <FormMessage />
    </FormItem>
  );
}
