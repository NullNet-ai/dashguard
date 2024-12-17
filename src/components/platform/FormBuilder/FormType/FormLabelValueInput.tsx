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
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

export interface InputData {
  id?: string;
  label: string;
  value: string;
}

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormLabelValueInput({
  fieldConfig,
  formRenderProps,
  form,
  formKey
}: IProps) {
  const { error } = useFormField() as IUserFormField;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: formRenderProps.field.name,
  });

  const handleAddInput = () => {
    append({ label: "", value: "" });
  };

  const handleInputChange = (index: number, name: string, value: string) => {
    form.setValue(`${formRenderProps.field.name}[${index}].${name}`, value);
  };

  const handleRemoveInput = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    if (!fields?.length) {
      handleAddInput();
    }
  });

  const { register } = form;

  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={`${formKey}-${fieldConfig.name}-lbl`}>
        {fieldConfig?.label}
      </FormLabel>

      {fields?.map((data: any, index) => {
        return (
          <div key={data?.id} className="mb-2 flex items-center space-x-2">
            <FormControl>
              <div className="w-full">
                <Input
                  {...register(`${formRenderProps.field.name}[${index}].label`)}
                    data-test-id={`${formKey}-${fieldConfig.name}-lbl-inp${index > 0 ? `-${index + 1}` : ""}`}
                    readOnly={fieldConfig?.readonly ?? false}
                    placeholder="Label"
                    disabled={formRenderProps?.field?.disabled || fieldConfig?.disabled}
                    onChange={(e) =>
                    handleInputChange(index, "label", e.target.value)
                    }
                  />
                {error?.[index]?.label && (
                    <p
                    className={cn("py-1 text-md font-medium text-destructive")}
                    data-test-id={`${formKey}-${fieldConfig.name}-err-msg${index > 0 ? `-${index + 1}` : ""}`}
                    >
                    {error?.[index]?.label?.message}
                    </p>
                )}
              </div>
            </FormControl>
            <FormControl>
                <div className="w-full">
                <Input
                  data-test-id={`${formKey}-${fieldConfig.name}-inp${index > 0 ? `-${index + 1}` : ""}`}
                  placeholder="Value"
                  readOnly={fieldConfig?.readonly ?? false}
                  onChange={(e) =>
                  handleInputChange(index, "value", e.target.value)
                  }
                />
                {error?.[index]?.value && (
                  <p
                  className={cn("py-1 text-md font-medium text-destructive")}
                  data-test-id={`${formKey}-${fieldConfig.name}-err-msg${index > 0 ? `-${index + 1}` : ""}`}
                  >
                  {error?.[index]?.value?.message}
                  </p>
                )}
                </div>
            </FormControl>
            {index > 0 && (
                <Button
                data-test-id={`${formKey}-${fieldConfig.name}-remove-btn${index > 1 ? `-${index + 1}` : ""}`}
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
        );
      })}

      <Button
        data-test-id={`${formKey}-${fieldConfig.name}-add-btn`}
        disabled={formRenderProps?.field?.disabled}
        type="button"
        onClick={handleAddInput}
        className="mt-2"
      >
        Add Item
      </Button>
    </FormItem>
  );
}
