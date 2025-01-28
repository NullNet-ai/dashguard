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
import { parse, isValid, format, set } from "date-fns";

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

  const { register } = form;
  const timePickerProps = fieldConfig.timePickerProps;
  const is24Hour = timePickerProps?.is24Hour;
  const timeFormat = is24Hour ? "HH:mm" : "hh:mm a";

  const parseTimeString = (timeStr: string): Date | null => {
    // Try parsing as 24-hour format first
    let date = parse(timeStr, "HH:mm", new Date());
    
    if (!isValid(date)) {
      // Try parsing as hour:minute without period
      date = parse(timeStr, "h:mm", new Date());
      
      if (isValid(date)) {
        // If no AM/PM specified, assume AM for 12-hour format
        if (!is24Hour) {
          date = set(date, { hours: date.getHours() % 12 });
        }
      } else {
        // Try parsing with AM/PM
        date = parse(timeStr, "h:mm a", new Date());
      }
    } else if (!is24Hour) {
      // Convert 24-hour time to 12-hour format
      date = set(date, { hours: date.getHours() % 12 });
    }
    
    return isValid(date) ? date : null;
  };

  const handleChange = (input: Date | string | undefined) => {
    if (!input) {
      form.setError(formKey, {
        type: "required",
        message: "Time is required. Please use the correct format.",
      });
      return;
    }

    let date: Date | null;

    if (typeof input === "string") {
      date = parseTimeString(input);
    } else {
      date = input;
    }

    if (!date || !isValid(date)) {
      form.setError(formKey, {
        type: "pattern",
        message: `Invalid Time Format. Please use the correct format (${timeFormat}).`,
      });
      return;
    }

    const formattedTime = format(date, timeFormat);
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
        <div
          className={cn(
            "w-full border border-input !m-0 focus-within:border-primary focus-within:ring-primary",
            !!form.formState.errors[formKey] && "border-destructive",
            fieldConfig.disabled && "bg-secondary"
          )}
        >
          <TimePicker
            {...register(fieldConfig.name)}
            data-test-id={`${formKey}-timepicker-${fieldConfig.name}`}
            is24Hour={is24Hour}
            className={timePickerProps?.className}
            ref={timePickerRef}
            disabled={fieldConfig.disabled}
            readonly={fieldConfig.readonly}
            onChange={handleChange}
            value={
              formRenderProps.field.value
                ? parseTimeString(String(formRenderProps.field.value)) || undefined
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