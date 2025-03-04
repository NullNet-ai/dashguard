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
  const is24Hour = fieldConfig.dateTimePickerProps?.is24Hour;

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
        formattedDate = includeTime 
          ? dateObj.format(displayFormat + (displayFormat.includes("HH:mm") ? "" : " HH:mm"))
          : dateObj.format(displayFormat);
      } else {
        // Use default format
        formattedDate = includeTime 
          ? dateObj.format("MM/DD/YYYY h:mm A") 
          : dateObj.format("MM/DD/YYYY");
      }

      const formatted_date = formattedDate?.includes("Invalid date")
        ? date
        : formattedDate;

      // Set the display format value
      form.setValue(`${name}`, formatted_date, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Always store the date in YYYY-MM-DD format for consistency
      form.setValue(`${name}_date`, dateObj.format("YYYY-MM-DD"), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Set the time in HH:mm format if time is included
      if (includeTime) {
        form.setValue(`${name}_time`, dateObj.format("HH:mm"), {
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

  const handleTimeChange = (time: string) => {
    const currentDate = form.getValues(`${name}_date`);
    if (currentDate) {
      const dateTime = moment(`${currentDate} ${time}`, "YYYY-MM-DD HH:mm");
      handleChange(dateTime.toDate());
    }
  };

  // Add a new handler for the TimePicker component
  const handleTimePickerChange = (date: Date | undefined) => {
    if (date) {
      const currentDate = form.getValues(`${name}_date`);
      if (currentDate) {
        // Extract hours and minutes from the date
        const hours = date.getHours();
        const minutes = date.getMinutes();
        
        // Format as HH:mm for the time field
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Create a new date with the current date and the selected time
        const dateTime = moment(`${currentDate} ${timeString}`, "YYYY-MM-DD HH:mm");
        handleChange(dateTime.toDate());
      }
    }
  };

  const getValue = () => {
    // Try to get the date from the combined value first
    const combinedValue = form.getValues(name);
    if (combinedValue) {
      const parsedDate = moment(combinedValue, ["MM/DD/YYYY h:mm A", "MM/DD/YYYY", "YYYY-MM-DD HH:mm"]);
      if (parsedDate.isValid()) return parsedDate.toDate();
    }
    
    // If that fails, try to construct from separate date and time fields
    const dateValue = form.getValues(`${name}_date`);
    const timeValue = includeTime ? form.getValues(`${name}_time`) : null;
    
    if (dateValue) {
      if (timeValue) {
        const dateTime = moment(`${dateValue} ${timeValue}`, "YYYY-MM-DD HH:mm");
        return dateTime.isValid() ? dateTime.toDate() : undefined;
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
              displayFormat: displayFormat
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