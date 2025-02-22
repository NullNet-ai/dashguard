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

interface CustomFieldProps {
  field: ControllerRenderProps<Record<string, any>, string>;
  fieldState: ControllerFieldState;
  form: UseFormReturn<Record<string, any>>;
  formKey: string;
  fieldConfig: IField;
}

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>>;
  value?: string;
  formKey: string;
  render?: (props: CustomFieldProps) => React.ReactNode;

}

export default function FormCustom({
  fieldConfig,
  form,
  formKey,
  formRenderProps,
  render,
}: IProps) {
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label} 
      </FormLabel>
      <FormControl>
        {render?.({
          ...formRenderProps,
          form,
          formKey,
          fieldConfig,
        })}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}