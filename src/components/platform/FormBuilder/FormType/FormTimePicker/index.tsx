import React, { useRef } from "react";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IFieldFilterActions, type IField } from "../../types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import TimePicker from "~/components/ui/time-picker";
import { cn } from "~/lib/utils";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  fieldFilterActions?: IFieldFilterActions;
  formKey: string;
}

const timeFormatRegex = /^([01]?\d|2[0-3]):[0-5]\d(?:\s?[APap][Mm])?$/;

export default function FormTimePicker({
  fieldConfig,
  formRenderProps,
  formKey,
  form,
}: IProps) {
  const isHidden = fieldConfig.hidden;
  const timePickerRef = useRef(null);

  if (isHidden) {
    return null;
  }
  const {register} = form
  const timePickerProps = fieldConfig.timePickerProps;

  
  const handleChange = (date: Date | undefined) => {
      const formattedTime = date
        ? date.toTimeString()?.split(" ")[0]?.slice(0, 5)
        : "";

    if (!formattedTime) {
      form.setError(formKey, {
        type: "required",
        message: "Time is required. Please use the correct format (e.g. HH:MM AM/PM).",
      });
      return;
    }

    if (!timeFormatRegex.test(formattedTime)) {
      form.setError(formKey, {
        type: "pattern",
        message: "Invalid Time Format. Please use the correct format (e.g. HH:MM AM/PM).",
      });
      return;
    }

    form.clearErrors(formKey);
    formRenderProps.field.onChange(formattedTime);
  };

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <div className={cn("w-full border border-input !m-0 focus-within:border-primary focus-within:ring-primary",!!form.formState.errors[formKey] && "border-destructive",fieldConfig.disabled && "bg-secondary")}>
          <TimePicker
          {...register(fieldConfig.name)}
            data-test-id={`${formKey}-timepicker-${fieldConfig.name}`}
            is24Hour={timePickerProps?.is24Hour}
            className={timePickerProps?.className}
            ref={timePickerRef}
            disabled={fieldConfig.disabled}
            readonly={fieldConfig.readonly}
            onChange={handleChange}
            value={
              formRenderProps.field.value
                ? new Date(`1970-01-01T${formRenderProps.field.value}Z`)
                : undefined
            }
      
          />
        </div>
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
        className="text-destructive"
      >
        {formRenderProps.fieldState.error?.message}
      </FormMessage>
    </FormItem>
  );
}
