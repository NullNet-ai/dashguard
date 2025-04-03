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
  readonly?: boolean; // Add readonly prop
  placeholder?: string;
  presets?: DateRangePreset[];
  displayValue?: string;
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
  readonly = false, // Add readonly with default false
  placeholder = "Select date range",
  presets = ["today", "yesterday", "tomorrow", "last7Days", "thisWeek", "thisMonth", "custom"],
  displayValue,
}: DateRangeProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | DateRangeWithTime | undefined>(value);
  const [activePreset, setActivePreset] = useState<DateRangePreset | undefined>(undefined);

  // Add useEffect to sync value with selectedRange
  useEffect(() => {
    // If value changes externally, update the selectedRange
    if (value !== undefined) {
      setSelectedRange(value);
    } else {
      // If value is undefined (which happens during form reset), clear the selection
      setSelectedRange(undefined);
      setActivePreset(undefined);
    }
  }, [value]);

  const handlePresetSelect = (preset: DateRangePreset) => {
    const today = new Date();
    let newRange: DateRange | DateRangeWithTime;

    switch (preset) {
      case "today":
        newRange = withTime
          ? {
            from: { date: today, time: new Date(today.setHours(0, 0, 0, 0)) },
            to: { date: today, time: new Date(today.setHours(23, 59, 59, 999)) }
          }
          : { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = addDays(today, -1);
        newRange = withTime
          ? {
            from: { date: yesterday, time: new Date(yesterday.setHours(0, 0, 0, 0)) },
            to: { date: yesterday, time: new Date(yesterday.setHours(23, 59, 59, 999)) }
          }
          : { from: yesterday, to: yesterday };
        break;
      case "tomorrow":
        const tomorrow = addDays(today, 1);
        newRange = withTime
          ? {
            from: { date: tomorrow, time: new Date(tomorrow.setHours(0, 0, 0, 0)) },
            to: { date: tomorrow, time: new Date(tomorrow.setHours(23, 59, 59, 999)) }
          }
          : { from: tomorrow, to: tomorrow };
        break;
      case "last7Days":
        const sevenDaysAgo = addDays(today, -6);
        newRange = withTime
          ? {
            from: { date: sevenDaysAgo, time: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)) },
            to: { date: today, time: new Date(today.setHours(23, 59, 59, 999)) }
          }
          : { from: sevenDaysAgo, to: today };
        break;
      case "last30Days":
        const thirtyDaysAgo = addDays(today, -29);
        newRange = withTime
          ? {
            from: { date: thirtyDaysAgo, time: new Date(thirtyDaysAgo.setHours(0, 0, 0, 0)) },
            to: { date: today, time: new Date(today.setHours(23, 59, 59, 999)) }
          }
          : { from: thirtyDaysAgo, to: today };
        break;
      case "thisWeek":
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        newRange = withTime
          ? {
            from: { date: weekStart, time: new Date(weekStart.setHours(0, 0, 0, 0)) },
            to: { date: weekEnd, time: new Date(weekEnd.setHours(23, 59, 59, 999)) }
          }
          : { from: weekStart, to: weekEnd };
        break;
      case "thisMonth":
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        newRange = withTime
          ? {
            from: { date: monthStart, time: new Date(monthStart.setHours(0, 0, 0, 0)) },
            to: { date: monthEnd, time: new Date(monthEnd.setHours(23, 59, 59, 999)) }
          }
          : { from: monthStart, to: monthEnd };
        break;
      case "custom":
      default:
        return;
    }

    setSelectedRange(newRange);
    setActivePreset(preset);
    onChange?.(newRange);
  };

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
          return `${format(fromDate, "MM/dd/yyyy")} ${fromTime && isValidDate(fromTime) ? format(fromTime, "hh:mm a") : ""}`;
        }

        return `${format(fromDate, "MM/dd/yyyy")} ${fromTime && isValidDate(fromTime) ? format(fromTime, "hh:mm a") : ""} – ${format(toDate, "MM/dd/yyyy")} ${toTime && isValidDate(toTime) ? format(toTime, "hh:mm a") : ""}`;
      }
    }

    const from = 'from' in selectedRange ? selectedRange.from as Date : undefined;
    const to = 'to' in selectedRange ? selectedRange.to as Date : undefined;

    if (!from || !isValidDate(from)) return placeholder;
    if (!to || !isValidDate(to)) return format(from, "MM/dd/yyyy");

    return `${format(from, "MM/dd/yyyy")} – ${format(to, "MM/dd/yyyy")}`;
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      setSelectedRange(undefined);
      onChange?.(undefined);
      return;
    }

    if (withTime) {
      const newRange: DateRangeWithTime = {
        from: range.from ? {
          date: range.from,
          time: selectedRange && 'from' in selectedRange && selectedRange.from &&
            'date' in selectedRange.from ? selectedRange.from.time : undefined
        } : undefined,
        to: range.to ? {
          date: range.to,
          time: selectedRange && 'to' in selectedRange && selectedRange.to &&
            'date' in selectedRange.to ? selectedRange.to.time : undefined
        } : undefined
      };
      setSelectedRange(newRange);
      onChange?.(newRange);
    } else {
      setSelectedRange(range);
      onChange?.(range);
    }

    setActivePreset("custom");
  };

  const handleTimeChange = (date: Date | undefined, isFrom: boolean) => {
    if (!withTime || !selectedRange) return;

    if (date && !isValidDate(date)) {
      date = undefined;
    }

    const rangeWithTime = selectedRange as DateRangeWithTime;

    if (isFrom && rangeWithTime.from) {
      const newRange = {
        ...rangeWithTime,
        from: { ...rangeWithTime.from, time: date }
      };
      setSelectedRange(newRange);
      onChange?.(newRange);
    } else if (!isFrom && rangeWithTime.to) {
      const newRange = {
        ...rangeWithTime,
        to: { ...rangeWithTime.to, time: date }
      };
      setSelectedRange(newRange);
      onChange?.(newRange);
    }
  };

  // Add the missing handleResetSelection function
  const handleResetSelection = () => {
    setSelectedRange(undefined);
    setActivePreset(undefined);
    // Pass undefined to the onChange handler to properly reset the field
    onChange?.(undefined);
  };
  
  // Modify the useEffect to properly handle reset
  useEffect(() => {
    // If value changes externally, update the selectedRange
    if (value !== undefined) {
      setSelectedRange(value);
    } else {
      // If value is undefined (which happens during form reset), clear the selection
      setSelectedRange(undefined);
      setActivePreset(undefined);
    }
  }, [value]);
  
  // Remove the duplicate useEffect that was added
  // (The one at the end of the file that doesn't handle undefined values)

  // Validate the range
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

  // Add useEffect to sync value with selectedRange
  useEffect(() => {
    // If value changes externally, update the selectedRange
    if (value !== undefined) {
      setSelectedRange(value);
    }
  }, [value]);

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
            <div className="flex items-center h-[36px] w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring">
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
                selectedRange && value && "text-foreground"
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
            "p-0 max-h-[80vh] overflow-auto",
            withTime ? "w-[350px] sm:w-[400px] md:w-auto" : "w-[300px] md:w-auto"
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
                  selected={withTime && selectedRange
                    ? {
                      from: selectedRange.from && 'date' in selectedRange.from ? selectedRange.from.date : undefined,
                      to: selectedRange.to && 'date' in selectedRange.to ? selectedRange.to.date : undefined
                    }
                    : selectedRange as DateRange
                  }
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
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