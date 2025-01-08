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

const FormDraggable = ({
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
  const defValue = fieldConfig.draggableConfig?.reduce(
    (acc: Record<string, any>, config) => {
      if (config) {
        acc[`${config.fields.name}`] = "";
      }
      return acc;
    },
    {} as Record<string, any>,
  );


  useEffect(() => {
    if (!fields?.length) {
      append(defValue);
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
  ) => {
    const commonProps = {
      disabled: isDisabled,
      className: "h-10 px-3",
    };

    switch (field.formType) {
      case "input":
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <Input
                {...register(`${fieldConfig.name}.${index}.${field.name}`)}
              {...commonProps} placeholder={field.placeholder} />
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
        }
        return (
          <FormItem>
            {index === 0 && <FormLabel>{field.label}</FormLabel>}
            <FormControl>
              <Select {...register(`${fieldConfig.name}.${index}.${field.name}`)}
              defaultValue={form.getValues(`${fieldConfig.name}.${index}.${field.name}`)}
              onValueChange={handleChange}
              >
                <SelectTrigger {...commonProps}>
                  <SelectValue placeholder={field.placeholder}   />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(field.selectOptions) &&
                    field.selectOptions.map((option) => (
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

  const fieldLength = fieldConfig?.draggableConfig?.length || 1;
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Sortable
          value={fields}
          onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
        >
          <div className="flex w-full flex-col gap-2">
            {fields.map((field, index) => (
              <SortableItem key={field.id} value={field.id} asChild>
                <div className={cn(`grid  items-end gap-2`,fieldLength === 1 ? "grid-cols-[auto_1fr_auto]":fieldLength === 2 ? "grid-cols-[auto_1fr_1fr_auto]":"grid-cols-[auto_1fr_1fr_1fr_auto]")}>
                  <SortableDragHandle
                    variant="ghost"
                    size="icon"
                    className="mb-1 size-8 shrink-0 text-muted-foreground"
                  >
                    <GripVerticalIcon className="size-6" aria-hidden="true" />
                  </SortableDragHandle>

                  {fieldConfig.draggableConfig?.map((config) => (
                    <FormField
                      key={config?.fields?.id ?? index}
                      control={form.control}
                      name={`${formRenderProps.field.name}-${index}-${config?.fields?.name ?? ""}`}
                      render={() =>
                        config ? (
                          (renderFormControl(config.fields, index) ?? <div />)
                        ) : (
                          <div />
                        )
                      }
                    />
                  ))}

                  <Button
                    type="button"
                    variant="softDestructive"
                    size="icon"
                    className="mb-1 size-6 shrink-0 rounded-full"
                    onClick={() => remove(index)}
                  >
                    <MinusIcon
                      className="size-4 text-destructive"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </SortableItem>
            ))}
            <Button
              className="mr-auto ms-7 gap-1 text-md text-primary hover:bg-transparent hover:opacity-70"
              variant="ghost"
              onClick={() => {
                append(defValue);
              }}
            >
              <PlusIcon className="size-5" aria-hidden="true" />
              Add {fieldConfig.label}
            </Button>
          </div>
        </Sortable>
      </FormControl>
      <DevTool control={form.control} />
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
};

export default FormDraggable;