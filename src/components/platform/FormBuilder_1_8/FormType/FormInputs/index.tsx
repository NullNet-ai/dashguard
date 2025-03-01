import React, { useEffect } from "react";
import {
  useFieldArray,
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IUserFormField, type IField, type IFieldFilterActions } from "../../types";
import {
  FormControl,
  FormItem,
  useFormField,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
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
  fieldFilterActions?: IFieldFilterActions;
  formKey: string;
}

export default function FormTextInputs({
  fieldConfig,
  formRenderProps,
  form,
  fieldFilterActions,
  formKey,
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
  });

  const { register } = form;
  const { handleSearch, ...restFieldFilterActions } = fieldFilterActions ?? {};

  return (
    <FormItem>
      {fields?.map((data, index) => (
        <div key={data?.id} className="mb-2 flex items-center">
          <FormControl>
            <div className="w-full">
              <Input
                {...register(`${formRenderProps.field.name}[${index}].value`)}
                 readOnly={(formRenderProps.field.disabled || fieldConfig?.readonly) ?? false}
                placeholder={fieldConfig?.placeholder}
                disabled={
                 undefined
                }
                type={fieldConfig?.type || "text"}
                data-test-id={`${formKey}-inp-${fieldConfig.name}`}
                {...fieldConfig}
                onChange={(e) => {
                  handleInputChange(index, e.target.value);
                  if (handleSearch) {
                    handleSearch(e.target.value);
                  }
                }}
                {...(restFieldFilterActions ?? {})}
              />
              {error?.[index] && (
                <p
                  id={data?.id}
                  className="py-1 text-md font-medium text-destructive"
                  data-test-id={`${formKey}-inp-${fieldConfig.name}-error-msg${index > 0 ? `-${index + 1}` : ""}`}
                >
                  {error?.[index]?.value?.message}
                </p>
              )}
            </div>
          </FormControl>
          {index > 0 && (
            <Button
              data-test-id={`${formKey}-inp-${fieldConfig.name}-remove-btn-${index + 1}`}
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
          data-test-id={`${formKey}-inp-${fieldConfig.name}-add-btn`}
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

