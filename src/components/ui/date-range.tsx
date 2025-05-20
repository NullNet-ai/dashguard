import { CalendarIcon } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isBefore, isEqual } from "date-fns";
import { useState, useEffect } from "react";
import { type DateRange } from "react-day-picker";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import TimePicker from "~/components/ui/time-picker";
import { useMediaQuery } from "react-responsive";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "tomorrow"
  | "last7Days"
  | "last30Days"
  | "thisWeek"
  | "thisMonth"
  | "custom";

export interface DateRangeWithTime {
  from?: {
    date: Date;
    time?: Date;
  };
  to?: {
    date: Date;
    time?: Date;
  };
}

export interface DateRangeProps {
  value?: DateRange | DateRangeWithTime;
  onChange?: (value: DateRange | DateRangeWithTime | undefined) => void;
  withTime?: boolean;
  is24Hour?: boolean;
  showPresets?: boolean;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  presets?: DateRangePreset[];
  displayValue?: string;
  error?: boolean; // Add error prop
}

const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export function DateRangePicker({
  value,
  onChange,
  withTime = false,
  is24Hour = true,
  showPresets = false,
  className,
  disabled = false,
  readonly = false,
  placeholder = "Select date range",
  presets = ["today", "yesterday", "tomorrow", "last7Days", "thisWeek", "thisMonth", "custom"],
  displayValue,
  error = false, // Add error with default false
}: DateRangeProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | DateRangeWithTime | undefined>(value);
  const [activePreset, setActivePreset] = useState<DateRangePreset | undefined>(undefined);
  // Add media query hook for responsive design
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  // Add useEffect to sync value with selectedRange - improve deep copying
  useEffect(() => {
    // If value changes externally, update the selectedRange
    if (value !== undefined) {
      // Create a deep copy to avoid reference issues
      if (withTime && 'from' in (value as any)) {
        const newValue: DateRangeWithTime = {
          from: undefined,
          to: undefined
        };
        
        if ((value as DateRangeWithTime).from) {
          newValue.from = {
            date: new Date((value as DateRangeWithTime).from!.date),
            time: (value as DateRangeWithTime).from!.time 
              ? new Date((value as DateRangeWithTime).from!.time!) 
              : undefined
          };
        }
        
        if ((value as DateRangeWithTime).to) {
          newValue.to = {
            date: new Date((value as DateRangeWithTime).to!.date),
            time: (value as DateRangeWithTime).to!.time 
              ? new Date((value as DateRangeWithTime).to!.time!) 
              : undefined
          };
        }
        
        setSelectedRange(newValue);
      } else {
        // For regular DateRange
        const newValue: DateRange = { from: undefined, to: undefined };
        
        if ((value as DateRange).from) {
          newValue.from = new Date((value as DateRange).from!);
        }
        
        if ((value as DateRange).to) {
          newValue.to = new Date((value as DateRange).to!);
        }
        
        setSelectedRange(newValue);
      }
    } else {
      // If value is undefined (which happens during form reset), clear the selection
      setSelectedRange(undefined);
      setActivePreset(undefined);
    }
  }, [value, withTime]);

  const handlePresetSelect = (preset: DateRangePreset) => {
    const today = new Date();
    let newRange: DateRange | DateRangeWithTime;

    switch (preset) {
      case "today":
        newRange = withTime
          ? {
            from: { 
              date: new Date(new Date().setHours(0, 0, 0, 0)), 
              time: new Date(new Date().setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: new Date(new Date().setHours(0, 0, 0, 0)), 
              time: new Date(new Date().setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = addDays(new Date(), -1);
        newRange = withTime
          ? {
            from: { 
              date: yesterday, 
              time: new Date(new Date(yesterday).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: yesterday, 
              time: new Date(new Date(yesterday).setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: yesterday, to: yesterday };
        break;
      case "tomorrow":
        const tomorrow = addDays(new Date(), 1);
        newRange = withTime
          ? {
            from: { 
              date: tomorrow, 
              time: new Date(new Date(tomorrow).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: tomorrow, 
              time: new Date(new Date(tomorrow).setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: tomorrow, to: tomorrow };
        break;
      case "last7Days":
        const sevenDaysAgo = addDays(new Date(), -7);
        newRange = withTime
          ? {
            from: { 
              date: sevenDaysAgo, 
              time: new Date(new Date(sevenDaysAgo).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: new Date(), 
              time: new Date(new Date().setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: sevenDaysAgo, to: today };
        break;
      case "last30Days":
        const thirtyDaysAgo = addDays(new Date(), -29);
        newRange = withTime
          ? {
            from: { 
              date: thirtyDaysAgo, 
              time: new Date(new Date(thirtyDaysAgo).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: new Date(), 
              time: new Date(new Date().setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: thirtyDaysAgo, to: today };
        break;
      case "thisWeek":
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
        newRange = withTime
          ? {
            from: { 
              date: weekStart, 
              time: new Date(new Date(weekStart).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: weekEnd, 
              time: new Date(new Date(weekEnd).setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: weekStart, to: weekEnd };
        break;
      case "thisMonth":
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        newRange = withTime
          ? {
            from: { 
              date: monthStart, 
              time: new Date(new Date(monthStart).setHours(0, 0, 0, 0))  // Set default time to 00:00
            },
            to: { 
              date: monthEnd, 
              time: new Date(new Date(monthEnd).setHours(23, 59, 0, 0))  // Set default time to 23:59
            }
          }
          : { from: monthStart, to: monthEnd };
        break;
      case "custom":
      default:
        return;
    }

    // Update state immediately without JSON serialization to avoid flickering
    setSelectedRange(newRange);
    setActivePreset(preset);
    
    // Notify parent without setTimeout to reduce flickering
    onChange?.(newRange);
  };

  // Fix the handleTimeChange function to ensure proper typing
  const handleTimeChange = (date: Date | undefined, isFrom: boolean) => {
    if (!withTime || !selectedRange) return;

    // Create a deep copy of the current range to avoid reference issues
    const currentRange = selectedRange as DateRangeWithTime;
    
    // Create a new range object with proper Date objects
    const newRange: DateRangeWithTime = {
      from: currentRange.from ? {
        date: new Date(currentRange.from.date),
        time: currentRange.from.time ? new Date(currentRange.from.time) : undefined
      } : undefined,
      to: currentRange.to ? {
        date: new Date(currentRange.to.date),
        time: currentRange.to.time ? new Date(currentRange.to.time) : undefined
      } : undefined
    };
    
    // Update the appropriate time value
    if (isFrom && newRange.from) {
      newRange.from.time = date ? new Date(date) : undefined;
    } else if (!isFrom && newRange.to) {
      newRange.to.time = date ? new Date(date) : undefined;
    }
    
    // Update local state first
    setSelectedRange(newRange);
    
    // Then notify parent component
    onChange?.(newRange);
  };

  // Improve the handleCalendarSelect function
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined);
      onChange?.(undefined);
      return;
    }

    if (withTime) {
      // Create a new range with default times
      const newRange: DateRangeWithTime = {
        from: range.from ? {
          date: new Date(range.from),
          // Always set a default time for from date
          time: new Date(new Date(range.from).setHours(0, 0, 0, 0))
        } : undefined,
        to: range.to ? {
          date: new Date(range.to),
          // Always set a default time for to date
          time: new Date(new Date(range.to).setHours(23, 59, 0, 0))
        } : undefined
      };
      
      // Update state directly with the new range that includes time values
      setSelectedRange(newRange);
      onChange?.(newRange);
    } else {
      // Create a new object to avoid reference issues
      const newRange: DateRange = {
        from: range.from ? new Date(range.from) : undefined,
        to: range.to ? new Date(range.to) : undefined
      };
      setSelectedRange(newRange);
      onChange?.(newRange);
    }

    setActivePreset("custom");
  };

  // Add the missing handleResetSelection function after handleCalendarSelect
  // Fix the handleResetSelection function by removing the unused parameter
  const handleResetSelection = () => {
    setSelectedRange(undefined);
    setActivePreset(undefined);
    onChange?.(undefined);
  };

  // Fix the nested useEffect issue by moving formatDateRange outside
  const formatDateRange = () => {
    if (displayValue !== undefined) return displayValue;

    if (!selectedRange) return placeholder;

    if (withTime && 'from' in selectedRange && selectedRange.from) {
      if ('date' in selectedRange.from) {
        const fromDate = selectedRange.from.date;
        const fromTime = selectedRange.from.time;
        const toDate = selectedRange.to && 'date' in selectedRange.to ? selectedRange.to.date : undefined;
        const toTime = selectedRange.to && 'date' in selectedRange.to ? selectedRange.to.time : undefined;

        if (!isValidDate(fromDate)) return placeholder;

        if (!toDate || !isValidDate(toDate)) {
          return `${format(fromDate, "MM/dd/yyyy")}${fromTime && isValidDate(fromTime) ? ` ${format(fromTime, is24Hour ? "HH:mm" : "hh:mm a")}` : ""}`;
        }

        return `${format(fromDate, "MM/dd/yyyy")}${fromTime && isValidDate(fromTime) ? ` ${format(fromTime, is24Hour ? "HH:mm" : "hh:mm a")}` : ""} – ${format(toDate, "MM/dd/yyyy")}${toTime && isValidDate(toTime) ? ` ${format(toTime, is24Hour ? "HH:mm" : "hh:mm a")}` : ""}`;
      }
    }

    const from = 'from' in selectedRange ? selectedRange.from as Date : undefined;
    const to = 'to' in selectedRange ? selectedRange.to as Date : undefined;

    if (!from || !isValidDate(from)) return placeholder;
    if (!to || !isValidDate(to)) return format(from, "MM/dd/yyyy");

    return `${format(from, "MM/dd/yyyy")} – ${format(to, "MM/dd/yyyy")}`;
  };

  // Fix the validation useEffect (remove the nested useEffect)
  useEffect(() => {
    if (!selectedRange) return;

    if (withTime && 'from' in selectedRange && selectedRange.from && selectedRange.to) {
      // Handle DateRangeWithTime validation
      if ('date' in selectedRange.from && 'date' in selectedRange.to) {
        // Validate dates first
        if (!isValidDate(selectedRange.from.date) || !isValidDate(selectedRange.to.date)) {
          // If dates are invalid, reset to undefined
          setSelectedRange(undefined);
          onChange?.(undefined);
          return;
        }

        const fromDateTime = selectedRange.from.time && isValidDate(selectedRange.from.time)
          ? selectedRange.from.time
          : new Date(selectedRange.from.date);

        const toDateTime = selectedRange.to.time && isValidDate(selectedRange.to.time)
          ? selectedRange.to.time
          : new Date(selectedRange.to.date);

        // If dates are the same, check if end time is before start time
        if (
          isEqual(selectedRange.from.date, selectedRange.to.date) &&
          isBefore(toDateTime, fromDateTime)
        ) {
          // Auto-correct by setting end time to start time
          const correctedRange: DateRangeWithTime = {
            from: {
              date: selectedRange.from.date,
              time: selectedRange.from.time && isValidDate(selectedRange.from.time)
                ? selectedRange.from.time
                : undefined
            },
            to: {
              date: selectedRange.to.date,
              time: fromDateTime
            }
          };
          setSelectedRange(correctedRange);
          onChange?.(correctedRange);
        }
      }
    } else if (!withTime && 'from' in selectedRange && selectedRange.from && selectedRange.to) {

      if (!(selectedRange.from instanceof Date) || !(selectedRange.to instanceof Date) ||
        isNaN(selectedRange.from.getTime()) || isNaN(selectedRange.to.getTime())) {
        setSelectedRange(undefined);
        onChange?.(undefined);
        return;
      }

      const from = selectedRange.from;
      const to = selectedRange.to;

      if (isBefore(to, from)) {
        const correctedRange: DateRange = { from, to: from };
        setSelectedRange(correctedRange);
        onChange?.(correctedRange);
      }
    }
  }, [selectedRange, withTime, onChange]);


  return (
    <div className={cn("grid gap-2 ", className)}>
      <Popover>
        <PopoverTrigger asChild onClick={e => {
          if (readonly) {
            e.preventDefault();
            return;
          }
        }}>
          {readonly ? (
            <div className={cn(
              "flex items-center h-[36px] w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring",
              error ? "border-destructive" : "border-input"
            )}>
              <CalendarIcon className="mr-2 size-5 text-muted-foreground flex-shrink-0" />
              <input 
                type="text" 
                readOnly 
                value={formatDateRange()}
                className={cn(
                  "w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-md font-normal",
                  (!selectedRange || !value) && "text-muted-foreground",
                  selectedRange && value && "text-foreground"
                )}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left text-md font-normal rounded-md h-[36px]",
                (!selectedRange || !value) && "text-muted-foreground",
                selectedRange && value && "text-foreground",
                error && "border-destructive"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 size-5" />
              {formatDateRange()}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 max-h-[76vh] overflow-auto z-0",
            withTime ? "sm:w-[400px] md:w-auto" : "w-[300px] md:w-auto"
          )}
          align="start"
        >
          <div className="flex flex-col md:flex-row">
            {showPresets && (
              <div className="border-b md:border-b-0 md:border-r border-border p-3 md:w-max shrink-0">
                <div className="text-sm font-medium mb-2">Presets</div>
                <div className="flex overflow-x-auto md:overflow-x-visible md:flex-col flex-nowrap gap-1 pb-1 md:max-w-[150px]">
                  {presets.includes("today") && (
                    <Button
                      variant={activePreset === "today" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("today")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      Today
                    </Button>
                  )}

                  {presets.includes("yesterday") && (
                    <Button
                      variant={activePreset === "yesterday" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("yesterday")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      Yesterday
                    </Button>
                  )}
                  {presets.includes("tomorrow") && (
                    <Button
                      variant={activePreset === "tomorrow" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("tomorrow")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      Tomorrow
                    </Button>
                  )}
                  {presets.includes("last7Days") && (
                    <Button
                      variant={activePreset === "last7Days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("last7Days")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      Last 7 Days
                    </Button>
                  )}
                  {presets.includes("last30Days") && (
                    <Button
                      variant={activePreset === "last30Days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("last30Days")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      Last 30 Days
                    </Button>
                  )}
                  {presets.includes("thisWeek") && (
                    <Button
                      variant={activePreset === "thisWeek" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("thisWeek")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      This Week
                    </Button>
                  )}
                  {presets.includes("thisMonth") && (
                    <Button
                      variant={activePreset === "thisMonth" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetSelect("thisMonth")}
                      className="justify-start whitespace-nowrap w-auto md:w-full"
                    >
                      This Month
                    </Button>
                  )}

                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row flex-grow">
              <div className="flex-grow min-w-0">
                <Calendar
                  mode="range"
                  defaultMonth={
                    selectedRange?.from instanceof Date
                      ? selectedRange.from
                      : selectedRange?.from && 'date' in selectedRange.from
                        ? selectedRange.from.date
                        : undefined
                  }
                  selected={
                    withTime && selectedRange && 'from' in selectedRange
                      ? {
                          from: selectedRange.from instanceof Date ? selectedRange.from : selectedRange.from?.date,
                          to: selectedRange.to instanceof Date ? selectedRange.to : selectedRange.to?.date
                        }
                      : selectedRange as DateRange
                  }
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  showOutsideDays={false}
                  disabled={disabled}
                  className="rounded-md w-full"
                />

                <div className="p-3 border-t border-border md:block hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSelection}
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Reset Selection
                  </Button>
                </div>
              </div>

              {withTime && (
                <div className="border-t md:border-t-0 md:border-l border-border p-3 mb-2 flex-none overflow-hidden">
                  <div className="text-sm font-medium mb-3">Time</div>
                  <div className="flex flex-col gap-2">
                    <div className="">
                      <span className="text-sm font-medium">Start Time</span>
                      <TimePicker
                        key={`start-time-${selectedRange?.from && 'date' in selectedRange.from ? selectedRange.from.date.getTime() : 'none'}`}
                        value={
                          selectedRange?.from &&
                          typeof selectedRange.from !== 'string' &&
                          'date' in selectedRange.from ?
                          selectedRange.from.time :
                          undefined
                        }
                        onChange={(date) => handleTimeChange(date, true)}
                        is24Hour={is24Hour}
                        disabled={
                          !selectedRange?.from ||
                          typeof selectedRange.from === 'string' ||
                          !('date' in selectedRange.from) ||
                          !selectedRange.from.date ||
                          disabled
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="">
                      <span className="text-sm font-medium">End Time</span>
                      <TimePicker
                        key={`end-time-${selectedRange?.to && 'date' in selectedRange.to ? selectedRange.to.date.getTime() : 'none'}`}
                        value={
                          selectedRange?.to &&
                          typeof selectedRange.to !== 'string' &&
                          'date' in selectedRange.to ?
                          selectedRange.to.time :
                          undefined
                        }
                        onChange={(date) => handleTimeChange(date, false)}
                        is24Hour={is24Hour}
                        disabled={
                          !selectedRange?.to ||
                          typeof selectedRange.to === 'string' ||
                          !('date' in selectedRange.to) ||
                          !selectedRange.to.date ||
                          disabled
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border md:hidden block">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSelection}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Reset Selection
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}