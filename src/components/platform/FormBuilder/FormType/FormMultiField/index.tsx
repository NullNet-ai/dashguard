import React, { useEffect } from "react";
import { GripVerticalIcon, MinusIcon, PlusIcon } from "lucide-react";
import { DevTool } from "@hookform/devtools";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  useFieldArray,
  type UseFormReturn,
} from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "~/components/ui/sortable";
import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
} from "../../types/global/interfaces";
import { cn } from "~/lib/utils";
import { ButtonWithDropdown } from "~/components/platform/ButtonWithDropdown";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  value?: string;
  formKey: string;
}

const FormMultiField = ({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) => {
  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  });
  const { register } = form;

  const isDisabled = formRenderProps.field.disabled;
  const isHidden = fieldConfig.hidden;
  const initialVal = {
    fieldType: "input",
    name: fieldConfig?.multiFieldConfig?.fields?.name ?? "",
  };
  const defValue = fieldConfig.multiFieldConfig?.fields?.name
    ? { [fieldConfig.multiFieldConfig.fields.name]: "" }
    : { name: "", fieldType: "input" };

  useEffect(() => {
    if (!fields?.length) {
      append({ ...initialVal, ...defValue });
    }
  }, []);
  if (isHidden) {
    return null;
  }

  const renderFormControl = (
    field: IField & {
      selectOptions?: ISelectOptions[];
      radioOptions?: IRadioOptions[];
      checkboxOptions?: ICheckboxOptions[];
    },
    index: number,
    fieldType: string,
    selectOptions?: any,
  ) => {

    const commonProps = {
      disabled: isDisabled,
      className: "h-10 px-3",
    };

    switch (fieldType) {
      case "input":
        return (
          <FormItem>
            <FormControl>
              <Input
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                {...commonProps}
                placeholder={field.placeholder}
              />
            </FormControl>
          </FormItem>
        );
      case "select":
        const handleChange = (e: string) => {
          form.setValue(`${fieldConfig.name}.${index}.${field.name}`, e, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        };
        return (
          <FormItem>
            <FormControl>
              <Select
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
                defaultValue={form.getValues(
                  `${fieldConfig.name}.${index}.${field.name}`,
                )}
                onValueChange={handleChange}
              >
                <SelectTrigger {...commonProps}>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(selectOptions) &&
                    selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        );
      default:
        return null;
    }
  };

  const dropOptions =
    fieldConfig.multiFieldConfig?.fieldOptions.map((option, index) => {
      return {
        label: option.label,
        onClick: () => {
          append({
            name: option.label,
            fieldType: option.fieldType,
            optionId: index
          });
        },
      };
    }) ?? [];

  return (
    <FormItem>
      <div className="py-2 h-[49px]">
      <ButtonWithDropdown
        entity={"test"}
        buttonClassName=""
        buttonVariant={"default"}
        leftIcon={PlusIcon}
        buttonLabel={"Add"}
        dropdownOptions={dropOptions}
        side="start"
        disabled={
          isDisabled
        }
      />
      </div>
      <div className="border-t-default-100 border-b border-t border-b-primary !m-0 h-[49px] flex items-center">
        <FormLabel className="">{fieldConfig.label}</FormLabel>
      </div>
      <FormControl>
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
        >
          <div className="!m-0 flex w-full flex-col">
            {fields.map((field, index) => (
              <SortableItem key={field.id} value={field.id} asChild
                draggable={isDisabled ? false : true}
              >
                <div className="border-default-100 flex flex-row items-center gap-2 border-b py-2">
                  {!isDisabled ? (
                     <SortableDragHandle
                      variant="link"
                      size="icon"
                      className="size-8 shrink-0 text-default/40"
                      disabled={isDisabled}
                    > 
                      <GripVerticalIcon /> 
                    </SortableDragHandle>
                  ) : null}
                  <div className="min-w-[150px]">
                    <FormLabel className="font-normal"
                    >
                      {form.getValues(`${fieldConfig.name}.${index}.name`) ??
                        fieldConfig.multiFieldConfig?.fields?.label}
                    </FormLabel>
                  </div>
                  <div
                    className={cn(
                      "flex-1",
                      `${form.getValues(`${fieldConfig.name}.${index}.fieldType`) === "input" ? "-mt-[8px]" : ""}`,
                    )}
                  >
                    <FormField
                      control={form.control}
                      disabled={isDisabled}
                      name={`${fieldConfig.multiFieldConfig?.fields.name}-${index}-${fieldConfig?.name ?? ""}`}
                      render={() =>
                        fieldConfig.multiFieldConfig ? (
                          (renderFormControl(
                            fieldConfig.multiFieldConfig.fields,
                            index,
                            form.getValues(
                              `${fieldConfig.name}.${index}.fieldType`,
                            ),
                            fieldConfig.multiFieldConfig?.fieldOptions[form.getValues(
                              `${fieldConfig.name}.${index}.optionId`,
                            )]?.options ?? []
                       
                           ,
                          ) ?? <div />)
                        ) : (
                          <div />
                        )
                      }
                    />
                  </div>
                  {!isDisabled ? (
                    <Button
                    disabled={isDisabled}
                    type="button"
                    variant="softDestructive"
                    size="icon"
                    className="mt-2 size-6 shrink-0 rounded-full"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Remove</span>
                  </Button>
                  ) : null}
                </div>
              </SortableItem>
            ))}
          </div>
        </Sortable>
      </FormControl>
      <DevTool control={form.control} />
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
};

export default FormMultiField;
