import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { parse, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '~/components/ui/calendar';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';

// Define date format constants
const DATE_FORMAT = {
    DISPLAY: {
      DEFAULT: "LLL dd, y",    // e.g. "Jan 01, 2023"
      SHORT: "MM/dd/yy",       // e.g. "01/01/23"
      MEDIUM: "MMM d, yyyy",   // e.g. "Jan 1, 2023"
      LONG: "MMMM d, yyyy",    // e.g. "January 1, 2023"
      ISO: "yyyy-MM-dd",       // e.g. "2023-01-01"
    },
    FORM: "MM/dd/yy",          // Format for form data
  };
  
  // DateRangePicker component for filters
  interface DateRangePickerProps {
    value?: string[];
    onChange: (dates: string[]) => void;
    defaultDisplayFormat?: keyof typeof DATE_FORMAT.DISPLAY;
    showFormatSelector?: boolean;
  }
  
  export default function DateRangePicker({ 
    value, 
    onChange, 
    defaultDisplayFormat = "SHORT",
    showFormatSelector = false
  }: DateRangePickerProps) {
    const [date, setDate] = useState<DateRange | undefined>();
    const [displayFormat, setDisplayFormat] = useState<keyof typeof DATE_FORMAT.DISPLAY>(defaultDisplayFormat);
  
    // Initialize date from value if available
    useEffect(() => {
      if (value && Array.isArray(value) && value.length > 0) {
        try {
          const firstDate = parse(value[0] ?? '', DATE_FORMAT.FORM, new Date());
          const lastDate = value.length > 1
            ? parse(value[value.length - 1] ?? '', DATE_FORMAT.FORM, new Date())
            : firstDate;
  
          setDate({
            from: firstDate,
            to: lastDate
          });
        } catch (error) {
          console.error("Error parsing dates:", error);
        }
      }
    }, [value]);
  
    // Handle date selection
    const handleSelect = (selectedDate: DateRange | undefined) => {
      setDate(selectedDate);
      
      // Update the form with only start and end dates
      if (selectedDate?.from) {
        const dates: string[] = [];
        // Add start date
        dates.push(format(selectedDate.from, DATE_FORMAT.FORM));
  
        // Add end date if it exists and is different
        if (selectedDate.to && selectedDate.from.getTime() !== selectedDate.to.getTime()) {
          dates.push(format(selectedDate.to, DATE_FORMAT.FORM));
        }
  
        onChange(dates);
      } else {
        onChange([]);
      }
    };
  
    return (
      <div className={cn("grid gap-2 bg-background")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className='mr-2 size-5' />
              {date?.from ? (
                date.to && date.from.getTime() !== date.to.getTime() ? (
                  <>
                    {format(date.from, DATE_FORMAT.DISPLAY[displayFormat])} -{" "}
                    {format(date.to, DATE_FORMAT.DISPLAY[displayFormat])}
                  </>
                ) : (
                  format(date.from, DATE_FORMAT.DISPLAY[displayFormat])
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 z-[9999] border bg-background shadow mr-7" 
            align="start"
            side='bottom'
            sideOffset={2}
            avoidCollisions={true}

          >
            {showFormatSelector && (
              <div className="p-2 border-b">
                <select
                  className="w-full p-1 text-sm border rounded"
                  value={displayFormat}
                  onChange={(e) => setDisplayFormat(e.target.value as keyof typeof DATE_FORMAT.DISPLAY)}
                >
                  <option value="DEFAULT">Default (LLL dd, y)</option>
                  <option value="SHORT">Short (MM/dd/yy)</option>
                  <option value="MEDIUM">Medium (MMM d, yyyy)</option>
                  <option value="LONG">Long (MMMM d, yyyy)</option>
                  <option value="ISO">ISO (yyyy-MM-dd)</option>
                </select>
              </div>
            )}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2} 
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
  