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
  const { fieldState } = formRenderProps; // Extract fieldState
  const { disabled, value, onChange } = field;
  const { description, label, required, disabled: isFieldConfigDisabled, dateRangeConfig:config, placeholder: fieldPlaceholder, readonly } = fieldConfig;
  
  const isDisabled = disabled || isFieldConfigDisabled;
  const isReadonly = readonly === true;
  const hasError = !!fieldState.error; // Check if there's an error
  
  // Extract date range configuration with defaults
  const withTime = config?.withTime ?? false;
  const is24Hour = config?.is24Hour ?? true;
  const showPresets = config?.showPresets ?? false;

  // Use placeholder from fieldConfig or default based on withTime
  const placeholder = fieldPlaceholder || (withTime ? "Select date and time range" : "Select date range");

  const componentType = withTime ? "DateRangeWithTime" : "DateRange";
  
  // Convert MM/DD/YYYY formatted string to DateRange or DateRangeWithTime object
  const convertToDateObjects = (): DateRange | DateRangeWithTime | undefined => {
    // First check if we have a value from the form
    if (value) {
      try {
        // Parse the value as an array of strings
        const parts = Array.isArray(value) ? value : [value, ""];
        
        if (parts.length === 0 || (parts[0] === "" && parts[1] === "")) {
          return undefined;
        }
        
        if (withTime) {
          // For DateRangeWithTime
          const result: DateRangeWithTime = {};
          
          // Parse the from date and time if available
          if (parts[0]) {
            const fromDateTimeParts = parts[0].split(' ');
            const fromDateStr = fromDateTimeParts[0]; // MM/DD/YYYY
            // Join the remaining parts to handle time with spaces (like "8:35 AM")
            const fromTimeStr = fromDateTimeParts.length > 1 ? fromDateTimeParts.slice(1).join(' ') : undefined;
            
            // Parse date from MM/DD/YYYY format
            const fromDate = parse(fromDateStr, 'MM/dd/yyyy', new Date());
            
            if (!isNaN(fromDate.getTime())) {
              result.from = { 
                date: new Date(fromDate.setHours(0, 0, 0, 0)), // Ensure consistent time part
                // Set default time to 00:00 if no time provided
                time: fromTimeStr ? undefined : new Date(new Date(fromDate).setHours(0, 0, 0, 0))
              };
              
              // Parse time if available
              if (fromTimeStr) {
                const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
                try {
                  const fromTime = parse(fromTimeStr, timeFormat, new Date());
                  
                  if (!isNaN(fromTime.getTime())) {
                    result.from.time = new Date(fromTime);
                  } else {
                    // If parsing fails, set default time
                    result.from.time = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
                  }
                } catch (e) {
                  console.error("Error parsing from time:", e);
                  // Set default time on error
                  result.from.time = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
                }
              }
            }
          }
          
          // Parse the to date and time if available
          if (parts[1]) {
            const toDateTimeParts = parts[1].split(' ');
            const toDateStr = toDateTimeParts[0]; // MM/DD/YYYY
            // Join the remaining parts to handle time with spaces (like "8:35 PM")
            const toTimeStr = toDateTimeParts.length > 1 ? toDateTimeParts.slice(1).join(' ') : undefined;
            
            // Parse date from MM/DD/YYYY format
            const toDate = parse(toDateStr, 'MM/dd/yyyy', new Date());
            
            if (!isNaN(toDate.getTime())) {
              result.to = { 
                date: new Date(toDate.setHours(0, 0, 0, 0)), // Ensure consistent time part
                // Set default time to 23:59 if no time provided
                time: toTimeStr ? undefined : new Date(new Date(toDate).setHours(23, 59, 0, 0))
              };
              
              // Parse time if available
              if (toTimeStr) {
                const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
                try {
                  const toTime = parse(toTimeStr, timeFormat, new Date());
                  
                  if (!isNaN(toTime.getTime())) {
                    result.to.time = new Date(toTime);
                  } else {
                    // If parsing fails, set default time
                    result.to.time = new Date(new Date(toDate).setHours(23, 59, 0, 0));
                  }
                } catch (e) {
                  console.error("Error parsing to time:", e);
                  // Set default time on error
                  result.to.time = new Date(new Date(toDate).setHours(23, 59, 0, 0));
                }
              }
            }
          }
          
          return result;
        } else {
          // For DateRange
          const result: Partial<DateRange> = {};
          
          // Parse the from date in MM/DD/YYYY format
          if (parts[0]) {
            const fromDate = parse(parts[0], 'MM/dd/yyyy', new Date());
            if (!isNaN(fromDate.getTime())) {
              // Create a new Date object to avoid reference issues
              result.from = new Date(fromDate.setHours(0, 0, 0, 0));
            }
          }
          
          // Parse the to date in MM/DD/YYYY format
          if (parts[1]) {
            const toDate = parse(parts[1], 'MM/dd/yyyy', new Date());
            if (!isNaN(toDate.getTime())) {
              // Create a new Date object to avoid reference issues
              result.to = new Date(toDate.setHours(0, 0, 0, 0));
            }
          }
          
          return Object.keys(result).length ? result as DateRange : undefined;
        }
      } catch (error) {
        console.error("Error parsing date range string:", error);
        return undefined;
      }
    } 
    // If no form value but we have a default value in the field config, use that
    else if (value) {
      try {
        // Handle default value which could be a string, array, or object
        if (typeof value === 'string') {
          // Single date string
          return convertStringToDateObject(value, "");
        } else if (Array.isArray(value)) {
          // Array of date strings
          return convertStringToDateObject(value[0] || "", value[1] || "");
        } else if (typeof value === 'object') {
          // Already in DateRange or DateRangeWithTime format
          return value as DateRange | DateRangeWithTime;
        }
      } catch (error) {
        console.error("Error parsing default date range:", error);
      }
    }
    
    return undefined;
  };
  
  // Helper function to convert string dates to DateRange/DateRangeWithTime objects
  const convertStringToDateObject = (fromStr: string, toStr: string): DateRange | DateRangeWithTime => {
    if (withTime) {
      // For DateRangeWithTime
      const result: DateRangeWithTime = {};
      
      // Parse the from date and time if available
      if (fromStr) {
        const fromDateTimeParts = fromStr.split(' ');
        const fromDateStr = fromDateTimeParts[0]; // MM/DD/YYYY
        const fromTimeStr = fromDateTimeParts.length > 1 ? fromDateTimeParts.slice(1).join(' ') : undefined;
        
        // Parse date from MM/DD/YYYY format
        const fromDate = fromDateStr ? parse(fromDateStr, 'MM/dd/yyyy', new Date()) : new Date();
        
        if (!isNaN(fromDate.getTime())) {
          result.from = { 
            date: new Date(fromDate.setHours(0, 0, 0, 0)),
            time: undefined 
          };
          
          // Parse time if available
          if (fromTimeStr) {
            const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
            try {
              const fromTime = parse(fromTimeStr, timeFormat, new Date());
              
              if (!isNaN(fromTime.getTime())) {
                result.from.time = new Date(fromTime);
              }
            } catch (e) {
              console.error("Error parsing from time:", e);
            }
          }
        }
      }
      
      // Parse the to date and time if available
      if (toStr) {
        const toDateTimeParts = toStr.split(' ');
        const toDateStr = toDateTimeParts[0]; // MM/DD/YYYY
        const toTimeStr = toDateTimeParts.length > 1 ? toDateTimeParts.slice(1).join(' ') : undefined;
        
        // Parse date from MM/DD/YYYY format
        const toDate = toDateStr ? parse(toDateStr, 'MM/dd/yyyy', new Date()) : new Date();
        
        if (!isNaN(toDate.getTime())) {
          result.to = { 
            date: new Date(toDate.setHours(0, 0, 0, 0)),
            time: undefined 
          };
          
          // Parse time if available
          if (toTimeStr) {
            const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
            try {
              const toTime = parse(toTimeStr, timeFormat, new Date());
              
              if (!isNaN(toTime.getTime())) {
                result.to.time = new Date(toTime);
              }
            } catch (e) {
              console.error("Error parsing to time:", e);
            }
          }
        }
      }
      
      return result;
    } else {
      // For DateRange
      const result: Partial<DateRange> = {};
      
      // Parse the from date in MM/DD/YYYY format
      if (fromStr) {
        const fromDate = parse(fromStr, 'MM/dd/yyyy', new Date());
        if (!isNaN(fromDate.getTime())) {
          result.from = new Date(fromDate.setHours(0, 0, 0, 0));
        }
      }
      
      // Parse the to date in MM/DD/YYYY format
      if (toStr) {
        const toDate = parse(toStr, 'MM/dd/yyyy', new Date());
        if (!isNaN(toDate.getTime())) {
          result.to = new Date(toDate.setHours(0, 0, 0, 0));
        }
      }
      
      return Object.keys(result).length ? result as DateRange : { from: undefined, to: undefined };
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
      
      // Create a deep copy to avoid reference issues
      const safeValue = JSON.parse(JSON.stringify(newValue));
      
      // Ensure Date objects are properly converted
      if (withTime && 'from' in safeValue) {
        // Check if from/to are DateRangeWithTime objects or plain Date objects
        if (safeValue.from) {
          if ('date' in safeValue.from) {
            // It's a DateRangeWithTime object
            safeValue.from.date = new Date(safeValue.from.date);
            if (safeValue.from.time) {
              safeValue.from.time = new Date(safeValue.from.time);
            }
          } else {
            // It's a plain Date object, convert to DateRangeWithTime format
            safeValue.from = {
              date: new Date(safeValue.from),
              time: undefined
            };
          }
        }
        
        if (safeValue.to) {
          if ('date' in safeValue.to) {
            // It's a DateRangeWithTime object
            safeValue.to.date = new Date(safeValue.to.date);
            if (safeValue.to.time) {
              safeValue.to.time = new Date(safeValue.to.time);
            }
          } else {
            // It's a plain Date object, convert to DateRangeWithTime format
            safeValue.to = {
              date: new Date(safeValue.to),
              time: undefined
            };
          }
        }
      } else if (!withTime) {
        if (safeValue.from) {
          safeValue.from = new Date(safeValue.from);
        }
        if (safeValue.to) {
          safeValue.to = new Date(safeValue.to);
        }
      }
      
      // Format the date range as an array of strings
      const formattedArray = formatDateRangeToArray(safeValue);
      
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
  

  // Format date range as array of strings [fromDateStr, toDateStr]
  const formatDateRangeToArray = (dateRange: DateRange | DateRangeWithTime | undefined): string[] => {
    if (!dateRange) return ["", ""];
    
    try {
      if (withTime && 'from' in dateRange) {
        // Format with time
        const fromObj = dateRange.from;
        const toObj = dateRange.to;
        
        let fromDate: Date | undefined;
        let fromTime: Date | undefined;
        let toDate: Date | undefined;
        let toTime: Date | undefined;
        
        // Handle both DateRangeWithTime and plain Date objects
        if (fromObj) {
          if ('date' in fromObj) {
            // It's a DateRangeWithTime object
            fromDate = fromObj.date;
            fromTime = fromObj.time;
          } else {
            // It's a plain Date object
            fromDate = fromObj as Date;
          }
        }
        
        if (toObj) {
          if ('date' in toObj) {
            // It's a DateRangeWithTime object
            toDate = toObj.date;
            toTime = toObj.time;
          } else {
            // It's a plain Date object
            toDate = toObj as Date;
          }
        }
        
        // Make sure we're using the correct format for time
        const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';
        
        const fromStr = fromDate && isValidDate(fromDate) ? 
          `${format(fromDate, 'MM/dd/yyyy')}${fromTime && isValidDate(fromTime) ? ` ${format(fromTime, timeFormat)}` : ''}` : '';
        
        const toStr = toDate && isValidDate(toDate) ? 
          `${format(toDate, 'MM/dd/yyyy')}${toTime && isValidDate(toTime) ? ` ${format(toTime, timeFormat)}` : ''}` : '';
        
        return [fromStr, toStr];
      } else {
        // Format date only in MM/DD/YYYY format
        const from = 'from' in dateRange ? dateRange.from as Date : undefined;
        const to = 'to' in dateRange ? dateRange.to as Date : undefined;
        
        const fromStr = from && isValidDate(from) ? format(from, 'MM/dd/yyyy') : '';
        const toStr = to && isValidDate(to) ? format(to, 'MM/dd/yyyy') : '';
        
        return [fromStr, toStr];
      }
    } catch (error) {
      console.error("Error formatting date range:", error);
      return ["", ""];
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
          error={hasError} // Pass the error state
        />
      </div>
      <FormDescription>{description}</FormDescription>
      <FormMessage data-test-id={kebabCase(formKey + " " + (fieldConfig.name) + componentType + "ErrorMessage")} />
    </FormItem>
  );
}
