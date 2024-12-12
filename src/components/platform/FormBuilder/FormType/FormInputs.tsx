import React, { useEffect } from "react";
import {
  useFieldArray,
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IUserFormField, type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  useFormField,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

export interface InputData {
  id?: string;
  value: string;
}

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
}

export default function FormTextInputs({
  fieldConfig,
  formRenderProps,
  form,
}: IProps) {
  const { error } = useFormField() as IUserFormField;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  });

  const handleAddInput = () => {
    append({ value: "" });
  };

  const handleInputChange = (index: number, value: string) => {
    form.setValue(`${formRenderProps.field.name}[${index}].value`, value);
  };

  const handleRemoveInput = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    if (!fields?.length) {
      handleAddInput();
    }
  }, []);

  const { register } = form;
  return (
    <FormItem>
      {fields?.map((data, index) => (
        <div key={data?.id} className="mb-2 flex items-center">
          <FormControl>
            <div className="w-full">
              <Input
                {...register(`${formRenderProps.field.name}[${index}].value`)}
                readOnly={fieldConfig?.readonly ?? false}
                placeholder={fieldConfig?.placeholder}
                disabled={formRenderProps?.field?.disabled || fieldConfig?.disabled}
                type={fieldConfig?.type || "text"}
                {...fieldConfig}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              {error?.[index] && (
                <p
                  id={data?.id}
                  className={cn("py-1 text-sm font-medium text-destructive")}
                >
                  {error?.[index]?.value?.message}
                </p>
              )}
            </div>
          </FormControl>
          {index > 0 && (
            <Button
              disabled={formRenderProps?.field?.disabled}
              type="button"
              variant="destructive"
              onClick={() => handleRemoveInput(index)}
              className="ml-2"
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      {fieldConfig?.options?.inputsType === "multiple" && (
        <Button
          disabled={formRenderProps?.field?.disabled}
          type="button"
          onClick={handleAddInput}
          className="mt-2"
        >
          Add Item
        </Button>
      )}
    </FormItem>
  );
}
