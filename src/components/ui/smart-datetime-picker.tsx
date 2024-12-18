"use client";

import React, { useCallback, useEffect } from "react";
import { parseDate } from "chrono-node";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type ActiveModifiers } from "react-day-picker";
import { Calendar, type CalendarProps } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { isValidDate } from "~/server/zodSchema/contact/contactDetails";

/* -------------------------------------------------------------------------- */
/*                               Inspired By:                                 */
/*                               @steventey                                   */
/* ------------------https://dub.co/blog/smart-datetime-picker--------------- */
/* -------------------------------------------------------------------------- */

/**
 * Utility function that parses dates.
 * Parses a given date string using the `chrono-node` library.
 *
 * @param str - A string representation of a date and time.
 * @returns A `Date` object representing the parsed date and time, or `null` if the string could not be parsed.
 */
export const parseDateTime = (str: Date | string) => {
  const is_valid_date = isValidDate(str);
  if (
    !is_valid_date &&
    typeof str == "string" &&
    str?.includes("Invalid Date")
  ) {
    return parseDate(str as string);
  }
  if (str instanceof Date) return str;
  const parsed_date = parseDate(str);
  return parsed_date ? parsed_date : str;
};

/**
 * Converts a given timestamp or the current date and time to a string representation in the local time zone.
 * format: `HH:mm`, adjusted for the local time zone.
 *
 * @param timestamp {Date | string}
 * @returns A string representation of the timestamp
 */
export const getDateTimeLocal = (timestamp?: Date): string => {
  const d = timestamp ? new Date(timestamp) : new Date();
  if (d.toString() === "Invalid Date") return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split(":")
    .slice(0, 2)
    .join(":");
};

/**
 * Formats a given date and time object or string into a human-readable string representation.
 * "MMM D, YYYY h:mm A" (e.g. "Jan 1, 2023 12:00 PM").
 *
 * @param datetime - {Date | string}
 * @returns A string representation of the date and time
 */
export const formatDateTime = (datetime: Date | string, includeTime = true) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };

  if (includeTime) {
    options.hour = "numeric";
    options.minute = "numeric";
    options.hour12 = true;
  }

  return new Date(datetime).toLocaleString("en-US", options);
};
const inputBase =
  "bg-transparent focus:outline-none focus:ring-0 focus-within:outline-none focus-within:ring-0 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50";

// @source: https://www.perplexity.ai/search/in-javascript-how-RfI7fMtITxKr5c.V9Lv5KA#1
// use this pattern to validate the transformed date string for the natural language input
const naturalInputValidationPattern =
  "^[A-Z][a-z]{2}sd{1,2},sd{4},sd{1,2}:d{2}s[AP]M$";

const DEFAULT_SIZE = 96;

/**
 * Smart time input Docs: {@link: https://shadcn-extension.vercel.app/docs/smart-time-input}
 */

interface SmartDatetimeInputProps {
  value?: Date;
  onValueChange: (date: Date | null | string) => void;
  inputProps?: NaturalLanguageInputProps;
  timePickerProps?: DateTimeLocalInputProps;
  dateTimePickerProps?: DateTimeLocalInputProps & {
    minDate?: Date;
    maxDate?: Date;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
  };
  className?: string; // Added className property
  placeholder?: string; // Added placeholder property
  disabled?: boolean; // Added disabled property
  inputTestID?: string; // Added inputTestID property
  datePickerTestID?: string; // Added datePickerTestID property
}

interface SmartDatetimeInputContextProps extends SmartDatetimeInputProps {
  Time: string;
  onTimeChange: (time: string) => void;
}

const SmartDatetimeInputContext =
  React.createContext<SmartDatetimeInputContextProps | null>(null);

const useSmartDateInput = () => {
  const context = React.useContext(SmartDatetimeInputContext);
  if (!context) {
    throw new Error(
      "useSmartDateInput must be used within SmartDateInputProvider",
    );
  }
  return context;
};

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SmartDatetimeInput = React.forwardRef<
  HTMLInputElement,
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "ref" | "value" | "defaultValue" | "onBlur"
  > &
    SmartDatetimeInputProps
>((props, ref) => {
  const {
    className,
    value,
    onValueChange,
    placeholder,
    disabled = false,
    datePickerTestID,
    inputTestID,
    readOnly,
    inputProps,
    dateTimePickerProps,
  } = props;
  // ? refactor to be only used with controlled input
  /*  const [dateTime, setDateTime] = React.useState<Date | undefined>(
    value ?? undefined
  ); */

  const [Time, setTime] = React.useState<string>("");

  const onTimeChange = React.useCallback((time: string) => {
    setTime(time);
  }, []);

  return (
    <SmartDatetimeInputContext.Provider
      value={{ value, onValueChange, Time, onTimeChange }}
    >
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "flex w-full focus-within:border-primary focus-within:ring-ring focus-within:ring-1 focus-within:ring-offset-0 ring-offset-background items-center justify-between gap-1 rounded-md border p-1 transition-all",
            "focus-within:outline-0 focus:outline-0 focus:ring-0",
            "placeholder:text-muted-foreground focus-visible:outline-0",
            className,
          )}
        >
          <DateTimeLocalInput
            datePickerTestID={datePickerTestID}
            disabled={disabled as boolean}
            readOnly={readOnly}
            {...dateTimePickerProps}
          />
          <NaturalLanguageInput
            data-test-id={inputTestID}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            readOnly={readOnly}
            {...inputProps}
          />
        </div>
      </div>
    </SmartDatetimeInputContext.Provider>
  );
});

SmartDatetimeInput.displayName = "DatetimeInput";

// Make it a standalone component

const TimePicker = () => {
  const { value, onValueChange, Time, onTimeChange } = useSmartDateInput();
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const timestamp = 15;

  const formateSelectedTime = React.useCallback(
    (time: string, hour: number, partStamp: number) => {
      onTimeChange(time);

      const newVal = parseDateTime(value ?? new Date());

      if (!newVal) return;

      (newVal as Date).setHours(
        hour,
        partStamp === 0 ? parseInt("00") : timestamp * partStamp,
      );

      // ? refactor needed check if we want to use the new date

      onValueChange(newVal as Date);
    },
    [value],
  );

  const handleKeydown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!document) return;

      const moveNext = () => {
        const nextIndex =
          activeIndex + 1 > DEFAULT_SIZE - 1 ? 0 : activeIndex + 1;

        const currentElm = document.getElementById(`time-${nextIndex}`);

        currentElm?.focus();

        setActiveIndex(nextIndex);
      };

      const movePrev = () => {
        const prevIndex =
          activeIndex - 1 < 0 ? DEFAULT_SIZE - 1 : activeIndex - 1;

        const currentElm = document.getElementById(`time-${prevIndex}`);

        currentElm?.focus();

        setActiveIndex(prevIndex);
      };

      const setElement = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`);

        if (!currentElm) return;

        currentElm.focus();

        const timeValue = currentElm.textContent ?? "";

        // this should work now haha that hour is what does the trick

        const PM_AM = timeValue.split(" ")[1];
        const timeParts = timeValue?.split(" ");
        const hourParts = timeParts?.[0]?.split(":");
        const PM_AM_hour = parseInt(hourParts?.[0] ?? "0");
        const hour =
          PM_AM === "AM"
            ? PM_AM_hour === 12
              ? 0
              : PM_AM_hour
            : PM_AM_hour === 12
              ? 12
              : PM_AM_hour + 12;

        const part = Math.floor(
          parseInt(timeValue.split(" ")[0]?.split(":")[1] ?? "0") / 15,
        );

        formateSelectedTime(timeValue, hour, part);
      };

      const reset = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`);
        currentElm?.blur();
        setActiveIndex(-1);
      };

      switch (e.key) {
        case "ArrowUp":
          movePrev();
          break;

        case "ArrowDown":
          moveNext();
          break;

        case "Escape":
          reset();
          break;

        case "Enter":
          setElement();
          break;
      }
    },
    [activeIndex, formateSelectedTime],
  );

  const handleClick = React.useCallback(
    (hour: number, part: number, PM_AM: string, currentIndex: number) => {
      formateSelectedTime(
        `${hour}:${part === 0 ? "00" : timestamp * part} ${PM_AM}`,
        hour,
        part,
      );
      setActiveIndex(currentIndex);
    },
    [formateSelectedTime],
  );

  const currentTime = React.useMemo(() => {
    const timeVal = Time.split(" ")[0];
    return {
      hours: timeVal ? parseInt(timeVal.split(":")[0] ?? "0") : 0,
      minutes: timeVal ? parseInt(timeVal.split(":")[1] ?? "0") : 0,
    };
  }, [Time]);

  React.useEffect(() => {
    const getCurrentElementTime = () => {
      const timeVal = Time.split(" ")[0];
      const hours = timeVal ? parseInt(timeVal.split(":")[0] ?? "0") : 0;
      const minutes = timeVal ? parseInt(timeVal.split(":")[1] ?? "0") : 0;
      const PM_AM = Time.split(" ")[1];

      const formatIndex =
        PM_AM === "AM" ? hours : hours === 12 ? hours : hours + 12;
      const formattedHours = formatIndex;

      for (let j = 0; j <= 3; j++) {
        const diff = Math.abs(j * timestamp - minutes);
        const selected =
          PM_AM === (formattedHours >= 12 ? "PM" : "AM") &&
          (minutes <= 53 ? diff < Math.ceil(timestamp / 2) : diff < timestamp);

        if (selected) {
          const trueIndex =
            activeIndex === -1 ? formattedHours * 4 + j : activeIndex;

          setActiveIndex(trueIndex);

          const currentElm = document.getElementById(`time-${trueIndex}`);
          currentElm?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }
    };

    getCurrentElementTime();
  }, [Time, activeIndex]);

  const height = React.useMemo(() => {
    if (!document) return;
    const calendarElm = document.getElementById("calendar");
    if (!calendarElm) return;
    return calendarElm.style.height;
  }, []);

  return (
    <div className="relative space-y-2 py-3 pr-3">
      <h3 className="text-sm font-medium">Time</h3>
      <ScrollArea
        onKeyDown={handleKeydown}
        className="h-[90%] w-full py-0.5 focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{
          height,
        }}
      >
        <ul
          className={cn(
            "flex h-full max-h-56 w-28 flex-col items-center gap-1 px-1 py-0.5",
          )}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const PM_AM = i >= 12 ? "PM" : "AM";
            const formatIndex = i > 12 ? i % 12 : i === 0 || i === 12 ? 12 : i;
            return Array.from({ length: 4 }).map((_, part) => {
              const diff = Math.abs(part * timestamp - currentTime.minutes);

              const trueIndex = i * 4 + part;

              // ? refactor : add the select of the default time on the current device (H:MM)
              const isSelected =
                (currentTime.hours === i ||
                  currentTime.hours === formatIndex) &&
                Time.split(" ")[1] === PM_AM &&
                (currentTime.minutes <= 53
                  ? diff < Math.ceil(timestamp / 2)
                  : diff < timestamp);

              const isSuggested = !value && isSelected;

              const currentValue = `${formatIndex}:${
                part === 0 ? "00" : timestamp * part
              } ${PM_AM}`;

              return (
                <li
                  tabIndex={isSelected ? 0 : -1}
                  id={`time-${trueIndex}`}
                  key={`time-${trueIndex}`}
                  aria-label="currentTime"
                  className={cn(
                    buttonVariants({
                      variant: isSuggested
                        ? "secondary"
                        : isSelected
                          ? "default"
                          : "outline",
                    }),
                    "h-8 w-full cursor-default px-3 text-sm outline-0 ring-0 focus-visible:border-0 focus-visible:outline-0",
                  )}
                  onClick={() => handleClick(i, part, PM_AM, trueIndex)}
                  onFocus={() => isSuggested && setActiveIndex(trueIndex)}
                >
                  {currentValue}
                </li>
              );
            });
          })}
        </ul>
      </ScrollArea>
    </div>
  );
};

export interface NaturalLanguageInputProps {
  placeholder?: string;
  disabled?: boolean;
  readOnly?:boolean;
  includeTime?: boolean; // New prop to control time handling
  onDateChange?: (date: Date) => void; // Optional callback for date change
  onTimeChange?: (time: string) => void; // Optional callback for time change
}

const NaturalLanguageInput = React.forwardRef<
  HTMLInputElement,
  NaturalLanguageInputProps
>(
  (
    {
      placeholder,
      includeTime = false, // Default to including time
      onDateChange,
      onTimeChange,
      readOnly=false,
      ...props
    },
    ref,
  ) => {
    const {
      value,
      onValueChange,
      Time,
      onTimeChange: contextOnTimeChange,
    } = useSmartDateInput();

    const _placeholder =
      placeholder ?? 'e.g. "tomorrow at 5pm" or "in 2 hours"';

    const [inputValue, setInputValue] = React.useState<string>("");

    React.useEffect(() => {
      if (value) {
        const formatted_date_time = formatDateTime(value, includeTime);
        const formatted_date = formatted_date_time?.includes("Invalid Date")
          ? value
          : formatted_date_time;
        setInputValue(formatted_date as string);

        if (includeTime) {
          const hour = value.getHours();
          const timeVal = `${
            hour >= 12 ? hour % 12 : hour
          }:${value.getMinutes().toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;

          // Prioritize prop-based onTimeChange, then context-based
          if (onTimeChange) {
            onTimeChange(timeVal);
          } else {
            contextOnTimeChange(timeVal);
          }
        }

        // Call additional date change callback if provided
        if (onDateChange) {
          onDateChange(value);
        }
      } else {
        setInputValue("");
        if (includeTime) {
          const now = new Date();
          const hour = now.getHours();
          const timeVal = `${
            hour >= 12 ? hour % 12 : hour
          }:${now.getMinutes().toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;

          if (onTimeChange) {
            onTimeChange(timeVal);
          } else {
            contextOnTimeChange(timeVal);
          }
        }
      }
    }, [value, includeTime]);

    const handleParse = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsedDateTime = parseDateTime(e.currentTarget.value);
      if (parsedDateTime) {
        const formatted = formatDateTime(parsedDateTime, includeTime);
        const formatted_date = formatted?.includes("Invalid Date")
          ? parsedDateTime
          : formatted;

        onValueChange(formatted_date);
        // onValueChange(parsedDateTime as Date);

        // Format with or without time based on includeTime
        setInputValue(formatted_date as string);

        if (includeTime) {
          const PM_AM = (parsedDateTime as Date).getHours() >= 12 ? "PM" : "AM";
          const PM_AM_hour = (parsedDateTime as Date).getHours();

          const hour =
            PM_AM_hour > 12
              ? PM_AM_hour % 12
              : PM_AM_hour === 0 || PM_AM_hour === 12
                ? 12
                : PM_AM_hour;

          const formattedTime = `${hour}:${(parsedDateTime as Date).getMinutes().toString().padStart(2, "0")} ${PM_AM}`;

          if (onTimeChange) {
            onTimeChange(formattedTime);
          } else {
            contextOnTimeChange(formattedTime);
          }
        }
      } else {
        const formatted = new Date(e.currentTarget.value);
        onValueChange(formatted);
        setInputValue(formatDateTime(formatted, includeTime));
      }
    };

    const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const parsedDateTime = parseDateTime(e.currentTarget.value);

        if (parsedDateTime) {
          const formatted = formatDateTime(parsedDateTime, includeTime);
          const formatted_date = formatted?.includes("Invalid Date")
            ? parsedDateTime
            : formatted;
          onValueChange(formatted_date);
          // onValueChange(parsedDateTime as Date);

          // Format with or without time based on includeTime
          setInputValue(formatted_date as string);

          if (includeTime) {
            const PM_AM =
              (parsedDateTime as Date).getHours() >= 12 ? "PM" : "AM";
            const PM_AM_hour = (parsedDateTime as Date).getHours();

            const hour =
              PM_AM_hour > 12
                ? PM_AM_hour % 12
                : PM_AM_hour === 0 || PM_AM_hour === 12
                  ? 12
                  : PM_AM_hour;

            const formattedTime = `${hour}:${(parsedDateTime as Date).getMinutes().toString().padStart(2, "0")} ${PM_AM}`;

            if (onTimeChange) {
              onTimeChange(formattedTime);
            } else {
              contextOnTimeChange(formattedTime);
            }
          }
        } else {
          onValueChange(null);
          setInputValue(formatDateTime("", includeTime));
        }
      }
    };

    const debouncedValue = useDebounce(inputValue, 500); // 500ms debounce delay
    const memoizedOnValueChange = useCallback(onValueChange, []);

    useEffect(() => {
      if (debouncedValue) {
        const parsedDateTime = parseDateTime(debouncedValue as Date | string);
        if (parsedDateTime) {
          const formatted = formatDateTime(parsedDateTime, includeTime);
          const formatted_date = formatted?.includes("Invalid Date")
            ? parsedDateTime
            : formatted;
          memoizedOnValueChange(formatted_date);
          // onValueChange(parsedDateTime as Date);

          // Format with or without time based on includeTime
          setInputValue(formatted_date as string);

          if (includeTime) {
            const PM_AM =
              (parsedDateTime as Date).getHours() >= 12 ? "PM" : "AM";
            const PM_AM_hour = (parsedDateTime as Date).getHours();

            const hour =
              PM_AM_hour > 12
                ? PM_AM_hour % 12
                : PM_AM_hour === 0 || PM_AM_hour === 12
                  ? 12
                  : PM_AM_hour;

            const formattedTime = `${hour}:${(parsedDateTime as Date).getMinutes().toString().padStart(2, "0")} ${PM_AM}`;

            if (onTimeChange) {
              onTimeChange(formattedTime);
            } else {
              contextOnTimeChange(formattedTime);
            }
          }
        } else {
          memoizedOnValueChange(null);
          setInputValue(formatDateTime("", includeTime));
        }
      }
    }, [debouncedValue, includeTime, memoizedOnValueChange]);

    return (
      <Input
        ref={ref}
        type="text"
        readOnly={readOnly}
        placeholder={_placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        onKeyDown={handleKeydown}
        onBlur={handleParse}
        className={cn("mr-0.5 h-8 flex-1 rounded border-none px-2 read-only:focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-0", inputBase)}
        {...props}
      />
    );
  },
);

NaturalLanguageInput.displayName = "NaturalLanguageInput";

export type DateTimeLocalInputProps = {
  disabled?: boolean;
  readOnly?:boolean;
} & CalendarProps;

const DateTimeLocalInput = ({
  className,
  minDate,
  maxDate,
  disablePastDates = false,
  disableFutureDates = false,
  includeTime = false,
  datePickerTestID,
  readOnly,
  disabled,
  ...props
}: DateTimeLocalInputProps & {
  minDate?: Date;
  maxDate?: Date;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  includeTime?: boolean;
  datePickerTestID?: string;
}) => {
  const { value, onValueChange, Time } = useSmartDateInput();

  const formatSelectedDate = React.useCallback(
    (
      date: Date | undefined,
      selectedDate: Date,
      m: ActiveModifiers,
      e: React.MouseEvent,
    ) => {
      const parsedDateTime = parseDateTime(selectedDate);

      if (parsedDateTime) {
        (parsedDateTime as Date).setHours(
          parseInt(Time?.split(":")[0] || "0"),
          parseInt(Time?.split(":")[1] || "0"),
        );
        onValueChange(parsedDateTime as Date);
      }
    },
    [value, Time],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={readOnly}
          className={cn(
            "flex size-9 items-center justify-center font-normal disabled:opacity-100",
            !value && "text-muted-foreground",
          )}
          data-test-id={datePickerTestID}
        >
          <CalendarIcon className="size-4" />
          <span className="sr-only">calender</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" sideOffset={8}>
        <div className="flex gap-1">
          <Calendar
            {...props}
            id={"calendar"}
            className={cn("peer flex justify-end", inputBase, className)}
            mode="single"
            selected={value}
            onSelect={formatSelectedDate}
            initialFocus
            disabled={(date) => {
              // If specific min/max dates are provided, use those first
              if (minDate || maxDate) {
                return (
                  (minDate ? date < minDate : false) ||
                  (maxDate ? date > maxDate : false)
                );
              }

              // If disable flags are set, use those
              if (disablePastDates || disableFutureDates) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (disablePastDates && date < today) return true;
                if (disableFutureDates && date > today) return true;
              }

              return false;
            }}
          />
          {includeTime && <TimePicker />}
        </div>
      </PopoverContent>
    </Popover>
  );
};

DateTimeLocalInput.displayName = "DateTimeLocalInput";
