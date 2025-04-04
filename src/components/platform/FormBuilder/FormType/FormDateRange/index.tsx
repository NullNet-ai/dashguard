import { type DateRange } from "react-day-picker";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { type IField } from "../../types";
import kebabCase from "lodash/kebabCase";
import { DateRangePicker, type DateRangeWithTime } from "~/components/ui/date-range";
import { format, parse } from "date-fns";

// Add isValidDate helper function
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, string>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<
    Record<string, unknown>,
    unknown,
    undefined
  >;
  formKey: string;
}

export default function FormDateRange({
  fieldConfig,
  formRenderProps,
  form: _form,
  formKey
}: IProps) {
  const { field } = formRenderProps;
  const { disabled, value, onChange } = field;
  const { description, label, required, disabled: isFieldConfigDisabled, dateRangeConfig:config, placeholder: fieldPlaceholder, readonly } = fieldConfig;
  
  const isDisabled = disabled || isFieldConfigDisabled;
  const isReadonly = readonly === true;
  
  // Extract date range configuration with defaults
  const withTime = config?.withTime ?? false;
  const is24Hour = config?.is24Hour ?? true;
  const showPresets = config?.showPresets ?? false;

  // Use placeholder from fieldConfig or default based on withTime
  const placeholder = fieldPlaceholder || (withTime ? "Select date and time range" : "Select date range");

  const componentType = withTime ? "DateRangeWithTime" : "DateRange";
  
  // Convert MM/DD/YYYY formatted string to DateRange or DateRangeWithTime object
  const convertToDateObjects = (): DateRange | DateRangeWithTime | undefined => {
    if (!value) return undefined;
    
    try {
      // Parse the value as an array of strings
      const parts = Array.isArray(value) ? value : [value, ""];
      
      if (parts.length === 0) {
        return undefined;
      }
      
      if (withTime) {
        // For DateRangeWithTime
        const result: DateRangeWithTime = {
          from: undefined, // Initialize with undefined to satisfy TypeScript
          to: undefined
        };
        
        // Parse the from date and time if available
        if (parts[0]) {
          const fromDateTimeParts = parts[0].split(' ');
          const fromDateStr = fromDateTimeParts[0]; // MM/DD/YYYY
          const fromTimeStr = fromDateTimeParts.length > 1 ? fromDateTimeParts[1] : undefined;
          
          // Parse date from MM/DD/YYYY format
          const fromDate = parse(fromDateStr, 'MM/dd/yyyy', new Date());
          
          if (!isNaN(fromDate.getTime())) {
            result.from = { date: fromDate };
            
            // Parse time if available
            if (fromTimeStr) {
              const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
              const fromTime = parse(fromTimeStr, timeFormat, new Date());
              
              if (!isNaN(fromTime.getTime())) {
                result.from.time = fromTime;
              }
            }
          }
        }
        
        // Parse the to date and time if available
        if (parts[1]) {
          const toDateTimeParts = parts[1].split(' ');
          const toDateStr = toDateTimeParts[0]; // MM/DD/YYYY
          const toTimeStr = toDateTimeParts.length > 1 ? toDateTimeParts[1] : undefined;
          
          // Parse date from MM/DD/YYYY format
          const toDate = parse(toDateStr, 'MM/dd/yyyy', new Date());
          
          if (!isNaN(toDate.getTime())) {
            result.to = { date: toDate };
            
            // Parse time if available
            if (toTimeStr) {
              const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
              const toTime = parse(toTimeStr, timeFormat, new Date());
              
              if (!isNaN(toTime.getTime())) {
                result.to.time = toTime;
              }
            }
          }
        }
        
        return result;
      } else {
        // For DateRange
        const result: DateRange = {
          from: undefined, // Initialize with undefined to satisfy TypeScript
          to: undefined
        };
        
        // Parse the from date in MM/DD/YYYY format
        if (parts[0]) {
          const fromDate = parse(parts[0], 'MM/dd/yyyy', new Date());
          if (!isNaN(fromDate.getTime())) {
            result.from = fromDate;
          }
        }
        
        // Parse the to date in MM/DD/YYYY format
        if (parts[1]) {
          const toDate = parse(parts[1], 'MM/dd/yyyy', new Date());
          if (!isNaN(toDate.getTime())) {
            result.to = toDate;
          }
        }
        
        return result;
      }
    } catch (error) {
      console.error("Error parsing date range string:", error);
      return undefined;
    }
  };
  
  // Format date range as array of strings [fromDateStr, toDateStr]
  const formatDateRangeToArray = (dateRange: DateRange | DateRangeWithTime | undefined): string[] => {
    if (!dateRange) return ["", ""];
    
    try {
      if (withTime && 'from' in dateRange && dateRange.from && typeof dateRange.from === 'object' && 'date' in dateRange.from) {
        // Format with time
        const fromDate = dateRange.from.date;
        const fromTime = dateRange.from.time;
        
        // Fix type checking for to.date and to.time
        const toDateObj = dateRange.to && typeof dateRange.to === 'object' && 'date' in dateRange.to 
          ? dateRange.to 
          : undefined;
        
        const toDate = toDateObj?.date;
        const toTime = toDateObj?.time;
        
        const fromStr = fromDate ? 
          `${format(fromDate, 'MM/dd/yyyy')}${fromTime ? ` ${format(fromTime, is24Hour ? 'HH:mm' : 'h:mm a')}` : ''}` : '';
        
        const toStr = toDate ? 
          `${format(toDate, 'MM/dd/yyyy')}${toTime ? ` ${format(toTime, is24Hour ? 'HH:mm' : 'h:mm a')}` : ''}` : '';
        
        return [fromStr, toStr];
      } else {
        // Format date only in MM/DD/YYYY format
        const fromDate = dateRange.from as Date | undefined;
        const toDate = dateRange.to as Date | undefined;
        
        // Check if fromDate and toDate are Date objects
        const fromStr = fromDate && isValidDate(fromDate) ? format(fromDate, 'MM/dd/yyyy') : '';
        const toStr = toDate && isValidDate(toDate) ? format(toDate, 'MM/dd/yyyy') : '';
        
        return [fromStr, toStr];
      }
    } catch (error) {
      console.error("Error formatting date range:", error);
      return ["", ""];
    }
  };
  
  // Add a safe onChange handler to convert to array of strings
  const handleSafeChange = (newValue: DateRange | DateRangeWithTime | undefined) => {
    try {
      if (!newValue) {
        // When resetting, set to undefined instead of empty array
        onChange(undefined);
        return;
      }
      
      // Format the date range as an array of strings
      const formattedArray = formatDateRangeToArray(newValue);
      
      // If both values are empty strings, return undefined instead
      if (formattedArray[0] === "" && formattedArray[1] === "") {
        onChange(undefined);
        return;
      }
      
      // Update form with the formatted array
      onChange(formattedArray);
    } catch (error) {
      console.error("Error in DateRange onChange handler:", error);
      onChange(undefined);
    }
  };

  // Format for display in the button
  const formatDateRangeForDisplay = (): string | undefined => {
    if (!value) return undefined;
    
    const parts = Array.isArray(value) ? value : [value, ""];
    const fromStr = parts[0] || "";
    const toStr = parts[1] || "";
    
    // If both parts are empty, return undefined to show placeholder
    if (!fromStr && !toStr) return undefined;
    
    return fromStr && toStr ? `${fromStr} – ${toStr}` : fromStr || toStr;
  };

  return (
    <FormItem>
      <FormLabel 
        required={required} 
        data-test-id={kebabCase(formKey + " " + (fieldConfig.name) + componentType + "FormLabel")}
      >
        {label}
      </FormLabel>
      <div className={cn("grid gap-2 rounded-md")}>
        <DateRangePicker
          value={convertToDateObjects()}
          onChange={handleSafeChange}
          withTime={withTime}
          is24Hour={is24Hour}
          showPresets={showPresets}
          disabled={isDisabled}
          readonly={isReadonly}
          placeholder={placeholder}
          displayValue={formatDateRangeForDisplay()}
        />
      </div>
      <FormDescription>{description}</FormDescription>
      <FormMessage data-test-id={kebabCase(formKey + " " + (fieldConfig.name) + componentType + "ErrorMessage")} />
    </FormItem>
  );
}
