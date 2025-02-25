import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../../types";
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
}

export default function FormCustom({
  fieldConfig,
  form,
  formKey,
  formRenderProps,
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
        })}
      </FormControl>
      {hasFormMessage && (
        <FormMessage />
      )}
    </FormItem>
  );
}