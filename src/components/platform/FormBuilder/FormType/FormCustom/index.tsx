import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { ISelectOptions, type IField } from "../../types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import React from "react";


interface IProps {
  fieldConfig: any;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>>;
  value?: string;
  formKey: string;
  selectOptions?: Record<string, ISelectOptions[]> | undefined;
}

export default function FormCustom({
  fieldConfig,
  form,
  formKey,
  formRenderProps,
  selectOptions
}: IProps) {
  const hasFormMessage = fieldConfig.hasFormMessage ?? true;

  return (
    <FormItem>
      <FormControl>
        {fieldConfig.render?.({
          ...formRenderProps,
          form,
          formKey,
          fieldConfig,
          selectOptions,
        })}
      </FormControl>
      {hasFormMessage && (
        <FormMessage />
      )}
    </FormItem>
  );
}