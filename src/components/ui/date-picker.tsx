import { Button, buttonVariants } from "~/components/ui/button";
import type { CalendarProps } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import {
  add,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfYear,
} from "date-fns";
import { type Locale, enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Clock } from "lucide-react";
import * as React from "react";
import { useImperativeHandle, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DayPicker, type Matcher } from "react-day-picker";

// ---------- utils start ----------
/**
 * regular expression to check for valid hour format (01-23)
 */
function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig,
) {
  let numericValue = parseInt(value, 10);

  if (!Number.isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, { max: 23 });
}

function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, { min: 1, max: 12 });
}

function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

function getValidArrowNumber(
  value: string,
  { min, max, step }: GetValidArrowNumberConfig,
) {
  let numericValue = parseInt(value, 10);
  if (!Number.isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), { min, max, loop: true });
  }
  return "00";
}

function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 23, step });
}

function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, { min: 1, max: 12, step });
}

function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, { min: 0, max: 59, step });
}

function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
type Period = "AM" | "PM";

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period,
) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return "00";
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      return getValid12Hour(String(display12HourValue(date.getHours())));
    default:
      return "00";
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case "minutes":
      return getValidArrowMinuteOrSecond(value, step);
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    }
    return hour;
  }

  if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

function genMonths(
  locale: Pick<Locale, "options" | "localize" | "formatLong">,
) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), "MMMM", { locale }),
  }));
}

// function genYears(yearRange = 50) {
//   const today = new Date();
//   return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
//     value: today.getFullYear() - yearRange + i,
//     label: (today.getFullYear() - yearRange + i).toString(),
//   }));
// }

// ---------- utils end ----------
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange = 50,
  disabled,
  disabledDates,
  ...props
}: CalendarProps & {
  yearRange?: number;
  disabled?: boolean;
  disabledDates?: Matcher | Matcher[];
}) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, "options" | "localize" | "formatLong"> = enUS;
    const { options, localize, formatLong } = props.locale || {};
    if (options && localize && formatLong) {
      locale = {
        options,
        localize,
        formatLong,
      };
    }
    return genMonths(locale);
  }, [props.locale]);

  const YEARS = React.useMemo(() => genYears(yearRange), [yearRange]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      disabled={disabled || disabledDates}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

interface PeriodSelectorProps {
  period: Period;
  setPeriod?: (m: Period) => void;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
    };

    const handleValueChange = (value: Period) => {
      setPeriod?.(value);

      /**
       * trigger an update whenever the user switches between AM and PM;
       * otherwise user must manually change the hour each time
       */
      if (date) {
        const tempDate = new Date(date);
        const hours = display12HourValue(date.getHours());
        onDateChange?.(
          setDateByType(
            tempDate,
            hours.toString(),
            "12hours",
            period === "AM" ? "PM" : "AM",
          ),
        );
      }
    };

    return (
      <div className="flex h-10 items-center">
        <Select
          defaultValue={period}
          onValueChange={(value: Period) => handleValueChange(value)}
        >
          <SelectTrigger
            ref={ref}
            className="w-[65px] focus:bg-accent focus:text-accent-foreground"
            onKeyDown={handleKeyDown}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
);

TimePeriodSelect.displayName = "TimePeriodSelect";

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType;
  date?: Date | null;
  onDateChange?: (date: Date | undefined) => void;
  period?: Period;
  onRightFocus?: () => void;
  onLeftFocus?: () => void;
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "tel",
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref,
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false);
    const [prevIntKey, setPrevIntKey] = React.useState<string>("0");

    /**
     * allow the user to enter the second digit within 2 seconds
     * otherwise start again with entering first digit
     */
    React.useEffect(() => {
      if (flag) {
        const timer = setTimeout(() => {
          setFlag(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [flag]);

    const calculatedValue = React.useMemo(() => {
      return getDateByType(date, picker);
    }, [date, picker]);

    const calculateNewValue = (key: string) => {
      /*
       * If picker is '12hours' and the first digit is 0, then the second digit is automatically set to 1.
       * The second entered digit will break the condition and the value will be set to 10-12.
       */
      if (picker === "12hours") {
        if (flag && calculatedValue.slice(1, 2) === "1" && prevIntKey === "0")
          return `0${key}`;
      }

      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") return;
      e.preventDefault();
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        const step = e.key === "ArrowUp" ? 1 : -1;
        const newValue = getArrowByType(calculatedValue, step, picker);
        if (flag) setFlag(false);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
      if (e.key >= "0" && e.key <= "9") {
        if (picker === "12hours") setPrevIntKey(e.key);

        const newValue = calculateNewValue(e.key);
        if (flag) onRightFocus?.();
        setFlag((prev) => !prev);
        const tempDate = date ? new Date(date) : new Date();
        onDateChange?.(setDateByType(tempDate, newValue, picker, period));
      }
    };

    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        className={cn(
          "w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault();
          onChange?.(e);
        }}
        type={type}
        inputMode="decimal"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          handleKeyDown(e);
        }}
        {...props}
      />
    );
  },
);

TimePickerInput.displayName = "TimePickerInput";

interface TimePickerProps {
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  hourCycle?: 12 | 24;
  /**
   * Determines the smallest unit that is displayed in the datetime picker.
   * Default is 'second'.
   * */
  granularity?: Granularity;
}

interface TimePickerRef {
  minuteRef: HTMLInputElement | null;
  hourRef: HTMLInputElement | null;
  secondRef: HTMLInputElement | null;
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ date, onChange, hourCycle = 24, granularity = "second" }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const secondRef = React.useRef<HTMLInputElement>(null);
    const periodRef = React.useRef<HTMLButtonElement>(null);
    const [period, setPeriod] = React.useState<Period>(
      date && date.getHours() >= 12 ? "PM" : "AM",
    );

    useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
        periodRef: periodRef.current,
      }),
      [minuteRef, hourRef, secondRef],
    );

    return (
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="datetime-picker-hour-input" className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4" />
        </label>
        <TimePickerInput
          picker={hourCycle === 24 ? "hours" : "12hours"}
          date={date}
          id="datetime-picker-hour-input"
          onDateChange={onChange}
          ref={hourRef}
          period={period}
          onRightFocus={() => minuteRef?.current?.focus()}
        />
        {(granularity === "minute" || granularity === "second") && (
          <>
            :
            <TimePickerInput
              picker="minutes"
              date={date}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {granularity === "second" && (
          <>
            :
            <TimePickerInput
              picker="seconds"
              date={date}
              onDateChange={onChange}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
        {hourCycle === 12 && (
          <div className="grid gap-1 text-center">
            <TimePeriodSelect
              period={period}
              setPeriod={setPeriod}
              date={date}
              onDateChange={(date) => {
                onChange?.(date);
                if (date && date?.getHours() >= 12) {
                  setPeriod("PM");
                } else {
                  setPeriod("AM");
                }
              }}
              ref={periodRef}
              onLeftFocus={() => secondRef?.current?.focus()}
            />
          </div>
        )}
      </div>
    );
  },
);
TimePicker.displayName = "TimePicker";

type Granularity = "year" | "month" | "day" | "hour" | "minute" | "second";

type DateTimePickerProps = {
  name?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  /** showing `AM/PM` or not. */
  hourCycle?: 12 | 24;
  placeholder?: string;
  /**
   * The year range will be: `This year + yearRange` and `this year - yearRange`.
   * Default is 50.
   * For example:
   * This year is 2024, The year dropdown will be 1974 to 2024 which is generated by `2024 - 50 = 1974` and `2024 + 50 = 2074`.
   * */
  yearRange?: number;
  /**
   * The format is derived from the `date-fns` documentation.
   * @reference https://date-fns.org/v3.6.0/docs/format
   **/
  displayFormat?: { hour24?: string; hour12?: string };
  /**
   * The granularity prop allows you to control the smallest unit that is displayed by DateTimePicker.
   * By default, the value is `second` which shows all time inputs.
   **/
  granularity?: Granularity;
  className?: string;
  /**
   * Disable dates before the specified date
   */
  minDate?: Date;
  /**
   * Disable dates after the specified date
   */
  maxDate?: Date;
  /**
   * Disable past dates (including today)
   */
  disablePast?: boolean;
  /**
   * Disable future dates (including today)
   */
  disableFuture?: boolean;
} & Pick<
  CalendarProps,
  "locale" | "weekStartsOn" | "showWeekNumber" | "showOutsideDays"
>;

type DateTimePickerRef = {
  value?: Date;
} & Omit<HTMLButtonElement, "value">;
// Helper function to generate years
const genYears = (range: number) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -range; i <= range; i++) {
    const year = currentYear + i;
    years.push({ value: year, label: year.toString() });
  }
  return years.sort((a, b) => b.value - a.value);
};

interface YearPickerProps {
  name?: string;
  date?: Date | null;
  onChange?: (date: Date | undefined) => void;
  yearRange?: number;
  disabled?: boolean;
  disabledDates?: { before?: Date; after?: Date };
  disablePast?: boolean;
  disableFuture?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const YearPicker = React.forwardRef<HTMLDivElement, YearPickerProps>(
  (
    {
      date,
      name,
      onChange,
      yearRange = 50,
      disabled = false,
      disabledDates,
      disablePast = false,
      disableFuture = false,
      minDate,
      maxDate,
      className,
    },
    ref,
  ) => {
    const YEARS = React.useMemo(() => genYears(yearRange), [yearRange]);
    const currentYear =
      date?.getFullYear().toString() || new Date().getFullYear().toString();

    // Generate disabled dates based on all constraints
    const effectiveDisabledDates = React.useMemo(() => {
      if (disabled)
        return {
          before: new Date(8640000000000000),
          after: new Date(-8640000000000000),
        };

      const now = new Date();
      const currentYearStart = startOfYear(now);

      let beforeDate = disabledDates?.before;
      let afterDate = disabledDates?.after;

      // Handle disablePast
      if (disablePast) {
        beforeDate = beforeDate
          ? isBefore(beforeDate, currentYearStart)
            ? currentYearStart
            : beforeDate
          : currentYearStart;
      }

      // Handle disableFuture
      if (disableFuture) {
        const endOfCurrentYear = new Date(now.getFullYear());
        afterDate = afterDate
          ? isAfter(afterDate, endOfCurrentYear)
            ? endOfCurrentYear
            : afterDate
          : endOfCurrentYear;
      }

      // Handle minDate
      if (minDate) {
        const minYearStart = startOfYear(minDate);
        beforeDate = beforeDate
          ? isBefore(beforeDate, minYearStart)
            ? minYearStart
            : beforeDate
          : minYearStart;
      }

      // Handle maxDate
      if (maxDate) {
        const maxYearStart = startOfYear(maxDate);
        afterDate = afterDate
          ? isAfter(afterDate, maxYearStart)
            ? maxYearStart
            : afterDate
          : maxYearStart;
      }

      return {
        before: beforeDate,
        after: afterDate,
      };
    }, [disabled, disabledDates, disablePast, disableFuture, minDate, maxDate]);

    // Function to check if a year should be disabled
    const isYearDisabled = React.useCallback(
      (year: number) => {
        if (disabled) return true;

        const yearDate = startOfYear(new Date(year, 0, 1));

        if (
          effectiveDisabledDates.before &&
          isBefore(yearDate, startOfYear(effectiveDisabledDates.before))
        ) {
          return true;
        }

        if (
          effectiveDisabledDates.after &&
          isAfter(yearDate, startOfYear(effectiveDisabledDates.after))
        ) {
          return true;
        }

        return false;
      },
      [disabled, effectiveDisabledDates],
    );

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center p-3", className)}
      >
        <Select
          name={"yearPicker" + name}
          value={currentYear}
          onValueChange={(value) => {
            const year = parseInt(value, 10);
            if (!isYearDisabled(year)) {
              const newDate = date ? new Date(date) : new Date();
              newDate.setFullYear(year);
              onChange?.(newDate);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "w-[120px]",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem
                key={year.value}
                value={year.value.toString()}
                disabled={isYearDisabled(year.value)}
                className={cn(
                  isYearDisabled(year.value) &&
                    "text-muted-foreground opacity-50",
                )}
              >
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);

YearPicker.displayName = "YearPicker";

export default YearPicker;

const MonthPicker = React.forwardRef<
  HTMLDivElement,
  {
    date?: Date | null;
    onChange?: (date: Date | undefined) => void;
    locale?: Locale;
    disabled?: { before?: Date; after?: Date } | boolean;
  }
>(({ date, onChange, locale = enUS, disabled = false }, ref) => {
  const MONTHS = React.useMemo(() => {
    let loc = enUS;
    const { options, localize, formatLong } = locale;
    if (options && localize && formatLong) {
      loc = { ...enUS, options, localize, formatLong };
    }
    return genMonths(loc);
  }, [locale]);

  const currentMonth =
    date?.getMonth().toString() || new Date().getMonth().toString();

  const isMonthDisabled = React.useCallback(
    (month: number) => {
      if (disabled === true) return true;
      if (disabled === false) return false;

      const testDate = date
        ? new Date(date.getFullYear(), month, 1)
        : new Date(new Date().getFullYear(), month, 1);

      if (disabled.before && isBefore(testDate, startOfDay(disabled.before))) {
        return true;
      }

      if (disabled.after && isAfter(testDate, startOfDay(disabled.after))) {
        return true;
      }

      return false;
    },
    [disabled, date],
  );

  return (
    <div ref={ref} className="flex items-center justify-center gap-2 p-3">
      <Select
        value={currentMonth}
        onValueChange={(value) => {
          if (disabled === true) return;
          const month = parseInt(value, 10);
          if (isMonthDisabled(month)) return;

          const newDate = date ? new Date(date) : new Date();
          newDate.setMonth(month);
          onChange?.(newDate);
        }}
        disabled={disabled === true}
      >
        <SelectTrigger
          className={cn(
            "w-[120px]",
            disabled === true && "pointer-events-none opacity-50",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem
              key={month.value}
              value={month.value.toString()}
              disabled={isMonthDisabled(month.value)}
              className={cn(
                isMonthDisabled(month.value) &&
                  "text-muted-foreground opacity-50",
              )}
            >
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

MonthPicker.displayName = "MonthPicker";

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = enUS,
      value,
      name,
      onChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = "second",
      placeholder = "Pick a date",
      className,
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      ...props
    },
    ref,
  ) => {
    const [month, setMonth] = React.useState<Date>(value ?? new Date());
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Function to check if a date should be disabled
    const isDateDisabled = React.useCallback(
      (date: Date) => {
        const startOfCurrentDay = startOfDay(date);

        if (
          disablePast &&
          isBefore(startOfCurrentDay, startOfDay(new Date()))
        ) {
          return true;
        }

        if (
          disableFuture &&
          isAfter(startOfCurrentDay, startOfDay(new Date()))
        ) {
          return true;
        }

        if (minDate && isBefore(startOfCurrentDay, startOfDay(minDate))) {
          return true;
        }

        if (maxDate && isAfter(startOfCurrentDay, startOfDay(maxDate))) {
          return true;
        }

        return false;
      },
      [disablePast, disableFuture, minDate, maxDate],
    );

    const handleSelect = (newDay: Date | undefined) => {
      if (!newDay || isDateDisabled(newDay)) return;

      if (!value) {
        onChange?.(newDay);
        setMonth(newDay);
        return;
      }
      const diff = newDay.getTime() - value.getTime();
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      const newDateFull = add(value, { days: Math.ceil(diffInDays) });
      onChange?.(newDateFull);
      setMonth(newDateFull);
    };

    useImperativeHandle(
      ref,
      () => ({
        ...buttonRef.current,
        value,
      }),
      [value],
    );

    // Update format patterns based on granularity
    const formatPatterns = {
      year: "yyyy",
      month: "MMMM yyyy",
      day: "PPP",
      hour: hourCycle === 24 ? "PPP HH:mm" : "PP hh:mm b",
      minute: hourCycle === 24 ? "PPP HH:mm" : "PP hh:mm b",
      second: hourCycle === 24 ? "PPP HH:mm:ss" : "PP hh:mm:ss b",
    };

    const initHourFormat = {
      hour24: displayFormat?.hour24 ?? formatPatterns[granularity],
      hour12: displayFormat?.hour12 ?? formatPatterns[granularity],
    };

    let loc = enUS;
    const { options, localize, formatLong } = locale;
    if (options && localize && formatLong) {
      loc = {
        ...enUS,
        options,
        localize,
        formatLong,
      };
    }

    // Generate disabled dates for the calendar
    const disabledDays = React.useMemo(() => {
      if (!disablePast && !disableFuture && !minDate && !maxDate) {
        return undefined;
      }

      return {
        before: disablePast
          ? startOfDay(new Date())
          : minDate
            ? startOfDay(minDate)
            : new Date(8640000000000000),
        after: disableFuture
          ? startOfDay(new Date())
          : maxDate
            ? startOfDay(maxDate)
            : new Date(-8640000000000000),
      };
    }, [disablePast, disableFuture, minDate, maxDate]);

    return (
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            data-test-id={
              "buttonTrigger" + name?.charAt(0).toUpperCase() + name?.slice(1)
            }
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className,
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(
                value,
                hourCycle === 24
                  ? initHourFormat.hour24
                  : initHourFormat.hour12,
                {
                  locale: loc,
                },
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          {granularity === "year" ? (
            <YearPicker
              date={value}
              onChange={onChange}
              yearRange={yearRange}
              disableFuture={disableFuture}
              disablePast={disablePast}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDays}
              disabled={disabled}
            />
          ) : granularity === "month" ? (
            <>
              <YearPicker
                date={value}
                onChange={onChange}
                yearRange={yearRange}
                disableFuture={disableFuture}
                disablePast={disablePast}
                minDate={minDate}
                maxDate={maxDate}
                disabledDates={disabledDays}
                disabled={disabled}
              />
              <MonthPicker
                date={value}
                onChange={onChange}
                disabled={disabled}
                locale={loc}
              />
            </>
          ) : (
            <>
              <Calendar
                mode="single"
                selected={value}
                month={month}
                onSelect={handleSelect}
                onMonthChange={setMonth}
                disabledDates={isDateDisabled}
                disabled={disabled}
                yearRange={yearRange}
                locale={locale}
                {...props}
              />
              {granularity !== "day" && (
                <div className="border-t border-border p-3">
                  <TimePicker
                    onChange={onChange}
                    date={value}
                    hourCycle={hourCycle}
                    granularity={granularity}
                  />
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker, TimePickerInput, TimePicker };
export type { TimePickerType, DateTimePickerProps, DateTimePickerRef };
