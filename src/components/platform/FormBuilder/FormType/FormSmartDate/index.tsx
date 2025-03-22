import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type IField } from "../../types";
import moment from "moment";
import { SmartDatetimeInput } from "~/components/ui/smart-datetime-picker";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, Date>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormSmartDate({
  fieldConfig,
  formRenderProps,
  form,
  formKey,
}: IProps) {
  const {
    label,
    disabled: isFieldDisable,
    dateGranularity,
    name,
    required,
  } = fieldConfig;

  const includeTime = fieldConfig.dateTimePickerProps?.includeTime;
  const useTimePicker = fieldConfig.dateTimePickerProps?.useTimePicker;
  const displayFormat = fieldConfig.dateTimePickerProps?.displayFormat;
  const is24Hour = fieldConfig.dateTimePickerProps?.is24Hour ?? true;
  const transformValuesToArray = fieldConfig.dateTimePickerProps?.transformValuesToArray ?? false
  const enableFormattedDate = fieldConfig.dateTimePickerProps?.enableFormattedDate ?? true

  const handleChange = (date: Date | null | string) => {
    if (date) {
      const dateObj = moment(date);
      
      // Format date based on granularity, display format, and whether time should be included
      let formattedDate;
      
      if (dateGranularity === "year") {
        formattedDate = dateObj.format("YYYY");
      } else if (dateGranularity === "month") {
        formattedDate = dateObj.format("YYYY-MM");
      } else if (displayFormat) {
        // Use the specified display format
        if (includeTime) {
          // Apply time format based on is24Hour setting
          const timeFormat = is24Hour ? "HH:mm" : "h:mm A";
          
          // Check if display format already includes time format
          if (displayFormat.includes("HH:mm") || displayFormat.includes("h:mm")) {
            // If display format already has time, use it but respect is24Hour setting
            const dateOnlyFormat = displayFormat
              .replace(/HH:mm|h:mm A/g, "")
              .trim();
            formattedDate = dateObj.format(`${dateOnlyFormat} ${timeFormat}`);
          } else {
            // If no time in display format, append the appropriate time format
            formattedDate = dateObj.format(`${displayFormat} ${timeFormat}`);
          }
        } else {
          formattedDate = dateObj.format(displayFormat);
        }
      } else {
        // Use default format
        if (includeTime) {
          formattedDate = is24Hour 
            ? dateObj.format("MM/DD/YYYY HH:mm") 
            : dateObj.format("MM/DD/YYYY h:mm A");
        } else {
          formattedDate = dateObj.format("MM/DD/YYYY");
        }
      }

      let formatted_date = formattedDate?.includes("Invalid date")
        ? date
        : formattedDate;

      if (transformValuesToArray) {
        formatted_date = [formattedDate] as any
      }
      // Set the display format value
      form.setValue(`${name}`, formatted_date, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      
      // Always store the date in YYYY-MM-DD format for consistency
      enableFormattedDate && form.setValue(`${name}_date`, dateObj.format("YYYY-MM-DD"), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Set the time in HH:mm format if time is included (always store in 24h format internally)
      if (includeTime) {
        // Store time in 24h format internally for consistency
        form.setValue(`${name}_time`, dateObj.format("HH:mm"), {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        
        // Also store a display time format that respects is24Hour setting
        const displayTimeFormat = is24Hour ? "HH:mm" : "h:mm A";
        form.setValue(`${name}_display_time`, dateObj.format(displayTimeFormat), {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } else {
      form.setValue(`${name}`, "");
      form.setValue(`${name}_date`, "");
      form.setValue(`${name}_time`, "");
    }
  };


  const getValue = () => {
    // Try to get the date from the combined value first
    const combinedValue = form.getValues(name);
    if (combinedValue) {
      // Add more format patterns to support both 12h and 24h formats
      const formatPatterns = [
        "MM/DD/YYYY h:mm A", 
        "MM/DD/YYYY HH:mm", 
        "MM/DD/YYYY",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD h:mm A"
      ];
      const parsedDate = moment(combinedValue, formatPatterns);
      if (parsedDate.isValid()) {
        // Return the parsed date directly
        return parsedDate.toDate();
      }
    }
    
    // If that fails, try to construct from separate date and time fields
    const dateValue = form.getValues(`${name}_date`);
    const timeValue = includeTime ? form.getValues(`${name}_time`) : null;
    
    if (dateValue) {
      if (timeValue) {
        // Parse the time value which is stored in 24-hour format
        const dateTime = moment(`${dateValue} ${timeValue}`, "YYYY-MM-DD HH:mm");
        
        if (dateTime.isValid()) {
          // Return the date object directly
          return dateTime.toDate();
        }
        return undefined;
      } else {
        const dateOnly = moment(dateValue, "YYYY-MM-DD");
        return dateOnly.isValid() ? dateOnly.toDate() : undefined;
      }
    }
    
    return null;
  };
  
  return (
    <FormItem className="flex w-full flex-col">
      <FormLabel
        required={required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {label}
      </FormLabel>
      <FormControl>
        <div className="flex flex-col gap-2">
          <SmartDatetimeInput
            datePickerTestID={`${formKey}-dte-picker-${fieldConfig.name}`}
            inputTestID={`${formKey}-inp-${fieldConfig.name}`}
            value={getValue() as Date | undefined}
            onValueChange={handleChange}
            placeholder={fieldConfig.placeholder}
            dateTimePickerProps={{
              ...fieldConfig.dateTimePickerProps,
              useTimePicker: useTimePicker, // Pass useTimePicker to control which time picker to use
              is24Hour: is24Hour, // Pass is24Hour to control time format
            }}
            inputProps={{
              ...fieldConfig.dateInputProps,
              includeTime: includeTime,
              displayFormat: displayFormat,
              is24Hour: is24Hour, // Explicitly pass is24Hour to inputProps as well
            }}
            disabled={isFieldDisable}
            readOnly={
              (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
            }
          />
        </div>
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}