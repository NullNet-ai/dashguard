'use client'

import { parseDate } from 'chrono-node'
import { Calendar as CalendarIcon } from 'lucide-react'
import React from 'react'

import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar, type CalendarProps } from '~/components/ui/calendar'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'
import { isValidDate } from '~/server/zodSchema/contact/contactDetails'

import { useFormField } from './form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

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
  const is_valid_date = isValidDate(str)
  if (
    !is_valid_date
    && typeof str == 'string'
    && str?.includes('Invalid Date')
  ) {
    return parseDate(str as string)
  }
  if (str instanceof Date) return str
  const parsed_date = parseDate(str)
  return parsed_date ? parsed_date : str
}

export type DateGranularity = 'time' | 'year' | 'month' | 'date'

/**
 * Converts a given timestamp or the current date and time to a string representation in the local time zone.
 * format: `HH:mm`, adjusted for the local time zone.
 *
 * @param timestamp {Date | string}
 * @returns A string representation of the timestamp
 */
export const getDateTimeLocal = (timestamp?: Date): string => {
  const d = timestamp ? new Date(timestamp) : new Date()
  if (d.toString() === 'Invalid Date') return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split(':')
    .slice(0, 2)
    .join(':')
}

/**
 * Formats a given date and time object or string into a human-readable string representation.
 * "MMM D, YYYY h:mm A" (e.g. "Jan 1, 2023 12:00 PM").
 *
 * @param datetime - {Date | string}
 * @returns A string representation of the date and time
 */
export const formatDateTime = (datetime: Date | string, includeTime = true) => {
  const options: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }

  if (includeTime) {
    options.hour = 'numeric'
    options.minute = 'numeric'
    options.hour12 = true
  }

  return new Date(datetime).toLocaleString('en-US', options)
}
const inputBase
  = 'bg-transparent focus:outline-none focus:ring-0 focus-within:outline-none focus-within:ring-0 sm:text-sm disabled:cursor-not-allowed disabled:opacity-50'

// @source: https://www.perplexity.ai/search/in-javascript-how-RfI7fMtITxKr5c.V9Lv5KA#1
// use this pattern to validate the transformed date string for the natural language input

const DEFAULT_SIZE = 96

/**
 * Smart time input Docs: {@link: https://shadcn-extension.vercel.app/docs/smart-time-input}
 */

interface SmartDatetimeInputProps {
  value?: Date
  onValueChange: (date: Date | null | string) => void
  inputProps?: NaturalLanguageInputProps
  timePickerProps?: DateTimeLocalInputProps
  dateTimePickerProps?: DateTimeLocalInputProps & {
    minDate?: Date
    maxDate?: Date
    disablePastDates?: boolean
    disableFutureDates?: boolean
  }
  // Added className property
  className?: string
  // Added placeholder property
  placeholder?: string
  // Added disabled property
  disabled?: boolean
  // Added inputTestID property
  inputTestID?: string
  // Added datePickerTestID property
  datePickerTestID?: string
}

interface SmartDatetimeInputContextProps extends SmartDatetimeInputProps {
  Time: string
  onTimeChange: (time: string) => void
}

const SmartDatetimeInputContext
  = React.createContext<SmartDatetimeInputContextProps | null>(null)

const useSmartDateInput = () => {
  const context = React.useContext(SmartDatetimeInputContext)
  if (!context) {
    throw new Error(
      'useSmartDateInput must be used within SmartDateInputProvider',
    )
  }
  return context
}

export const SmartDatetimeInput = React.forwardRef<
  HTMLInputElement,
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'ref' | 'value' | 'defaultValue' | 'onBlur'
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
  } = props
  // ? refactor to be only used with controlled input
  /*  const [dateTime, setDateTime] = React.useState<Date | undefined>(
    value ?? undefined
  ); */

  const [Time, setTime] = React.useState<string>('')

  const onTimeChange = React.useCallback((time: string) => {
    setTime(time)
  }, [])

  const { error } = useFormField()
  return (
    <SmartDatetimeInputContext.Provider
      value={{ value, onValueChange, Time, onTimeChange }}
    >
      <div className='flex items-center justify-center'>
        <div
          className={cn(
            'flex w-full items-center h-[36px] justify-between gap-1 rounded-md border  ring-offset-background transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0', 'focus-within:outline-0 focus:outline-0 focus:ring-0', 'placeholder:text-muted-foreground focus-visible:outline-0', !!error && 'border-destructive', className,
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
            disabled={disabled}
            placeholder={placeholder}
            readOnly={readOnly}
            ref={ref}
            {...inputProps}
          />
        </div>
      </div>
    </SmartDatetimeInputContext.Provider>
  )
})

SmartDatetimeInput.displayName = 'DatetimeInput'

// Make it a standalone component

const TimePicker = () => {
  const { value, onValueChange, Time, onTimeChange } = useSmartDateInput()
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const timestamp = 15

  const formateSelectedTime = React.useCallback(
    (time: string, hour: number, partStamp: number) => {
      onTimeChange(time)

      const newVal = parseDateTime(value ?? new Date())

      if (!newVal) return;

      (newVal as Date).setHours(
        hour, partStamp === 0 ? parseInt('00') : timestamp * partStamp,
      )

      // ? refactor needed check if we want to use the new date

      onValueChange(newVal as Date)
    }, [value],
  )

  const handleKeydown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation()

      if (!document) return

      const moveNext = () => {
        const nextIndex
          = activeIndex + 1 > DEFAULT_SIZE - 1 ? 0 : activeIndex + 1

        const currentElm = document.getElementById(`time-${nextIndex}`)

        currentElm?.focus()

        setActiveIndex(nextIndex)
      }

      const movePrev = () => {
        const prevIndex
          = activeIndex - 1 < 0 ? DEFAULT_SIZE - 1 : activeIndex - 1

        const currentElm = document.getElementById(`time-${prevIndex}`)

        currentElm?.focus()

        setActiveIndex(prevIndex)
      }

      const setElement = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`)

        if (!currentElm) return

        currentElm.focus()

        const timeValue = currentElm.textContent ?? ''

        // this should work now haha that hour is what does the trick

        const PM_AM = timeValue.split(' ')[1]
        const timeParts = timeValue?.split(' ')
        const hourParts = timeParts?.[0]?.split(':')
        const PM_AM_hour = parseInt(hourParts?.[0] ?? '0')
        const hour
          = PM_AM === 'AM'
            ? PM_AM_hour === 12
              ? 0
              : PM_AM_hour
            : PM_AM_hour === 12
              ? 12
              : PM_AM_hour + 12

        const part = Math.floor(
          parseInt(timeValue.split(' ')[0]?.split(':')[1] ?? '0') / 15,
        )

        formateSelectedTime(timeValue, hour, part)
      }

      const reset = () => {
        const currentElm = document.getElementById(`time-${activeIndex}`)
        currentElm?.blur()
        setActiveIndex(-1)
      }

      switch (e.key) {
        case 'ArrowUp':
          movePrev()
          break

        case 'ArrowDown':
          moveNext()
          break

        case 'Escape':
          reset()
          break

        case 'Enter':
          setElement()
          break
      }
    }, [activeIndex, formateSelectedTime],
  )

  const handleClick = React.useCallback(
    (hour: number, part: number, PM_AM: string, currentIndex: number) => {
      formateSelectedTime(
        `${hour}:${part === 0 ? '00' : timestamp * part} ${PM_AM}`, hour, part,
      )
      setActiveIndex(currentIndex)
    }, [formateSelectedTime],
  )

  const currentTime = React.useMemo(() => {
    const timeVal = Time.split(' ')[0]
    return {
      hours: timeVal ? parseInt(timeVal.split(':')[0] ?? '0') : 0,
      minutes: timeVal ? parseInt(timeVal.split(':')[1] ?? '0') : 0,
    }
  }, [Time])

  React.useEffect(() => {
    const getCurrentElementTime = () => {
      const timeVal = Time.split(' ')[0]
      const hours = timeVal ? parseInt(timeVal.split(':')[0] ?? '0') : 0
      const minutes = timeVal ? parseInt(timeVal.split(':')[1] ?? '0') : 0
      const PM_AM = Time.split(' ')[1]

      const formatIndex
        = PM_AM === 'AM' ? hours : hours === 12 ? hours : hours + 12
      const formattedHours = formatIndex

      for (let j = 0; j <= 3; j++) {
        const diff = Math.abs(j * timestamp - minutes)
        const selected
          = PM_AM === (formattedHours >= 12 ? 'PM' : 'AM')
            && (minutes <= 53 ? diff < Math.ceil(timestamp / 2) : diff < timestamp)

        if (selected) {
          const trueIndex
            = activeIndex === -1 ? formattedHours * 4 + j : activeIndex

          setActiveIndex(trueIndex)

          const currentElm = document.getElementById(`time-${trueIndex}`)
          currentElm?.scrollIntoView({
            block: 'center',
            behavior: 'smooth',
          })
        }
      }
    }

    getCurrentElementTime()
  }, [Time, activeIndex])

  const height = React.useMemo(() => {
    if (!document) return
    const calendarElm = document.getElementById('calendar')
    if (!calendarElm) return
    return calendarElm.style.height
  }, [])

  return (
    <div className='relative space-y-2 py-3 pr-3'>
      <h3 className='text-sm font-medium'>Time</h3>
      <ScrollArea
        className='h-[90%] w-full py-0.5 focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0'
        style={{
          height,
        }}
        onKeyDown={handleKeydown}
      >
        <ul
          className={cn(
            'flex h-full max-h-56 w-28 flex-col items-center gap-1 px-1 py-0.5',
          )}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const PM_AM = i >= 12 ? 'PM' : 'AM'
            const formatIndex = i > 12 ? i % 12 : i === 0 || i === 12 ? 12 : i
            return Array.from({ length: 4 }).map((_, part) => {
              const diff = Math.abs(part * timestamp - currentTime.minutes)

              const trueIndex = i * 4 + part

              // ? refactor : add the select of the default time on the current device (H:MM)
              const isSelected
                = (currentTime.hours === i
                  || currentTime.hours === formatIndex)
                && Time.split(' ')[1] === PM_AM
                && (currentTime.minutes <= 53
                  ? diff < Math.ceil(timestamp / 2)
                  : diff < timestamp)

              const isSuggested = !value && isSelected

              const currentValue = `${formatIndex}:${
                part === 0 ? '00' : timestamp * part
              } ${PM_AM}`

              return (
                <button
                  aria-label='currentTime'
                  aria-selected={isSelected}
                  className={cn(buttonVariants({
                    variant: isSuggested
                      ? 'secondary'
                      : isSelected
                        ? 'default'
                        : 'outline',
                  }), 'h-8 w-full cursor-default px-3 text-sm outline-0 ring-0 focus-visible:border-0 focus-visible:outline-0',
                  )}
                  id={`time-${trueIndex}`}
                  key={`time-${trueIndex}`}
                  role='option'
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleClick(i, part, PM_AM, trueIndex)}
                  onFocus={() => isSuggested && setActiveIndex(trueIndex)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleClick(i, part, PM_AM, trueIndex)
                    }
                  }}
                >
                  {currentValue}
                </button>
              )
            })
          })}
        </ul>
      </ScrollArea>
    </div>
  )
}

export interface NaturalLanguageInputProps {
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  includeTime?: boolean
  onDateChange?: (date: Date) => void
  onTimeChange?: (time: string) => void
}

const NaturalLanguageInput = React.forwardRef<
  HTMLInputElement,
  NaturalLanguageInputProps
>(
  (
    {
      placeholder,
      includeTime = false,
      onDateChange,
      onTimeChange,
      readOnly = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const {
      value,
      onValueChange,
      onTimeChange: contextOnTimeChange,
    } = useSmartDateInput()

    const _placeholder
      = placeholder ?? 'e.g. "tomorrow at 5pm" or "in 2 hours"'

    const [inputValue, setInputValue] = React.useState<string>('')

    React.useEffect(() => {
      if (!value) {
        setInputValue('')
        return
      }

      const formatted_date_time = formatDateTime(value, includeTime)
      const formatted_date = formatted_date_time?.includes('Invalid Date')
        ? value
        : formatted_date_time
      setInputValue(formatted_date as string)

      if (includeTime) {
        const hour = value.getHours()
        const timeVal = `${
          hour >= 12 ? hour % 12 : hour
        }:${value.getMinutes().toString()
          .padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`

        if (onTimeChange) {
          onTimeChange(timeVal)
        }
        else {
          contextOnTimeChange(timeVal)
        }
      }

      if (onDateChange) {
        onDateChange(value)
      }
    }, [value, includeTime])

    const handleParse = (
      e:
        | React.FocusEvent<HTMLInputElement>
        | React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const currentValue = e.currentTarget.value.trim()

      if (!currentValue) {
        onValueChange(null)
        setInputValue('')
        return
      }

      const parsedDateTime = parseDateTime(currentValue)
      if (parsedDateTime) {
        const formatted = formatDateTime(parsedDateTime, includeTime)
        const formatted_date = formatted?.includes('Invalid Date')
          ? parsedDateTime
          : formatted

        onValueChange(formatted_date)
        setInputValue(formatted_date as string)

        if (includeTime) {
          const PM_AM = (parsedDateTime as Date).getHours() >= 12 ? 'PM' : 'AM'
          const PM_AM_hour = (parsedDateTime as Date).getHours()

          const hour
            = PM_AM_hour > 12
              ? PM_AM_hour % 12
              : PM_AM_hour === 0 || PM_AM_hour === 12
                ? 12
                : PM_AM_hour

          const formattedTime = `${hour}:${(parsedDateTime as Date).getMinutes().toString()
            .padStart(2, '0')} ${PM_AM}`

          if (onTimeChange) {
            onTimeChange(formattedTime)
          }
          else {
            contextOnTimeChange(formattedTime)
          }
        }
      }
      else {
        onValueChange(null)
        setInputValue(currentValue)
      }
    }

    const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleParse(e)
      }
    }

    return (
      <Input
        className={cn(
          `mr-0.5 h-8 flex-1 rounded border-none px-2 ps-0 focus-visible:ring-0 focus-visible:ring-transparent read-only:focus-visible:border-transparent`, inputBase,
        )}
        disabled={disabled}
        placeholder={_placeholder}
        readOnly={readOnly}
        ref={ref}
        type='text'
        value={inputValue}
        onBlur={readOnly || disabled ? undefined : handleParse}
        onChange={e => setInputValue(e.currentTarget.value)}
        onKeyDown={handleKeydown}
        {...props}
      />
    )
  },
)

NaturalLanguageInput.displayName = 'NaturalLanguageInput'
export type DateTimeLocalInputProps = {
  disabled?: boolean
  readOnly?: boolean
} & CalendarProps

const DateTimeLocalInput = (props: DateTimeLocalInputProps & {
  minDate?: Date
  maxDate?: Date
  disablePastDates?: boolean
  disableFutureDates?: boolean
  includeTime?: boolean
  datePickerTestID?: string
}) => {
  const { value, onValueChange, Time } = useSmartDateInput()
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [, setErrorMessage] = React.useState<string | null>(null)

  const getValidDate = React.useCallback(
    (date: Date | undefined): Date | undefined => {
      if (!date || isNaN(date.getTime())) {
        setErrorMessage(null)
        return undefined
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (props.disablePastDates && date < today) {
        setErrorMessage('Selected date is in the past and not allowed.')
        return today
      }
      if (props.disableFutureDates && date > today) {
        setErrorMessage('Selected date is in the future and not allowed.')
        return today
      }
      if (props.minDate && date < props.minDate) {
        setErrorMessage(
          'Selected date is earlier than the minimum allowed date.',
        )
        return props.minDate
      }
      if (props.maxDate && date > props.maxDate) {
        setErrorMessage(
          'Selected date is later than the maximum allowed date.',
        )
        return props.maxDate
      }

      setErrorMessage(null)
      return date
    }, [props.disablePastDates, props.disableFutureDates, props.minDate, props.maxDate],
  )

  const getInitialDate = React.useCallback(() => {
    const today = new Date()
    if (value && !isNaN(value.getTime())) return value
    if (props.minDate && props.minDate > today) return props.minDate
    if (props.disablePastDates) return today
    return today
  }, [value, props.minDate, props.disablePastDates])

  const [month, setMonth] = React.useState<number>(() => getInitialDate().getMonth())
  const [year, setYear] = React.useState<number>(() => getInitialDate().getFullYear())

  React.useEffect(() => {
    const newDate = getInitialDate()
    setMonth(newDate.getMonth())
    setYear(newDate.getFullYear())
  }, [value, props.disablePastDates, getInitialDate])

  React.useEffect(() => {
    const validDate = getValidDate(value) ?? new Date()
    setMonth(validDate.getMonth())
    setYear(validDate.getFullYear())
  }, [value, getValidDate])

  const formatSelectedDate = React.useCallback(
    (
      date: Date | undefined,
      selectedDate: Date,
    ) => {
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        setErrorMessage('Invalid date selected')
        return
      }

      const parsedDateTime = parseDateTime(selectedDate)
      if (parsedDateTime) {
        const hours = parseInt(Time?.split(':')[0] || '0')
        const minutes = parseInt(Time?.split(':')[1] || '0')

        if (!isNaN(hours) && !isNaN(minutes)) {
          (parsedDateTime as Date).setHours(hours, minutes)
          onValueChange(parsedDateTime as Date)
        }
      }
    }, [Time, onValueChange],
  )

  const handleMonthNavigation = (newDate: Date) => {
    const startOfNewMonth = new Date(
      newDate.getFullYear(), newDate.getMonth(), 1
    );
    const endOfNewMonth = new Date(
      newDate.getFullYear(), newDate.getMonth() + 1, 0
    );
  
    if (
      props.minDate &&
      startOfNewMonth < new Date(props.minDate.getFullYear(), props.minDate.getMonth(), 1)
    ) {
      return;
    }
  
    if (
      props.maxDate &&
      endOfNewMonth > new Date(props.maxDate.getFullYear(), props.maxDate.getMonth() + 1, 0)
    ) {
      return;
    }
  
    const today = new Date();
    if (props.disablePastDates) {
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      if (startOfNewMonth < startOfCurrentMonth) {
        return;
      }
    }
  
    if (props.disableFutureDates) {
      const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      if (endOfNewMonth > endOfCurrentMonth) {
        return;
      }
    }
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };

  const getLastValidDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getAdjustedDate = (
    targetYear: number,
    targetMonth: number,
    currentDate: Date | undefined,
  ): Date => {
    if (!currentDate || isNaN(currentDate.getTime())) {
      return new Date(targetYear, targetMonth, 1)
    }

    const currentDay = currentDate.getDate()
    const lastDayOfTargetMonth = getLastValidDayOfMonth(
      targetYear, targetMonth,
    )

    const targetDay = Math.min(currentDay, lastDayOfTargetMonth)

    return new Date(targetYear, targetMonth, targetDay)
  }

  const handleMonthChange = (newMonth: string) => {
    const newMonthNum = parseInt(newMonth)
    const newDate = getAdjustedDate(year, newMonthNum, value)
    handleMonthNavigation(newDate)
  }

  const handleYearChange = (newYear: string) => {
    const newYearNum = parseInt(newYear)
    const newDate = getAdjustedDate(newYearNum, month, value)
    handleMonthNavigation(newDate)
  }

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    let startYear = currentYear - 100
    let endYear = currentYear + 100

    if (props.minDate) {
      startYear = Math.max(startYear, props.minDate.getFullYear())
    }
    if (props.maxDate) {
      endYear = Math.min(endYear, props.maxDate.getFullYear())
    }
    if (props.disablePastDates) {
      startYear = Math.max(startYear, currentYear)
    }
    if (props.disableFutureDates) {
      endYear = Math.min(endYear, currentYear)
    }

    return Array.from(
      { length: endYear - startYear + 1 }, (_, i) => startYear + i,
    )
  }, [props.minDate, props.maxDate, props.disablePastDates, props.disableFutureDates])

  const getValidMonths = React.useCallback(() => {
    const allMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const currentYear = year
    const currentDate = new Date()

    return allMonths.filter((_, index) => {
      const monthStart = new Date(currentYear, index, 1)
      const monthEnd = new Date(currentYear, index + 1, 0)

      if (
        props.minDate
        && monthEnd < new Date(props.minDate.getFullYear(), props.minDate.getMonth(), 1)
      ) {
        return false
      }
      if (
        props.maxDate
        && monthStart > new Date(props.maxDate.getFullYear(), props.maxDate.getMonth() + 1, 0)
      ) {
        return false
      }
      if (props.disablePastDates) {
        const currentYearMonth
          = currentDate.getFullYear() * 12 + currentDate.getMonth()
        const monthStartYearMonth
          = monthStart.getFullYear() * 12 + monthStart.getMonth()
        if (monthStartYearMonth < currentYearMonth) {
          return false
        }
      }
      if (props.disableFutureDates) {
        const currentYearMonth
          = currentDate.getFullYear() * 12 + currentDate.getMonth()
        const monthStartYearMonth
          = monthStart.getFullYear() * 12 + monthStart.getMonth()
        if (monthStartYearMonth > currentYearMonth) {
          return false
        }
      }

      return true
    })
  }, [year, props.minDate, props.maxDate, props.disablePastDates, props.disableFutureDates])

  const validMonths = React.useMemo(() => getValidMonths(), [getValidMonths])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isOpen) {
        e.preventDefault()
        buttonRef.current?.click()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild={true}>
        <Button
          className={cn(
            'flex items-center justify-center font-normal hover:bg-transparent  disabled:opacity-100 active:!translate-y-0', !value && 'text-muted-foreground',
          )}
          data-test-id={props.datePickerTestID}
          disabled={props.readOnly}
          ref={buttonRef}
          size='icon'
          variant='ghost'
        >
          <CalendarIcon className='size-5' />
          <span className='sr-only'>calendar</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-0' sideOffset={10}>
        <div className='p-3'>
          <div className='flex items-center justify-center gap-1'>
            {!(props.disablePastDates && new Date(year, month) < new Date()) && (
              <Select
                value={month.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className='w-[140px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validMonths.map((monthName, index) => (
                    <SelectItem key={monthName} value={index.toString()}>
                      {monthName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className='w-[100px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex gap-1'>
            <Calendar
              {...props}
              className={cn('peer flex justify-end', inputBase, props.className)}
              disabled={(date) => {
                if (props.minDate || props.maxDate) {
                  return (
                    (props.minDate ? date < props.minDate : false)
                    || (props.maxDate ? date > props.maxDate : false)
                  )
                }

                if (props.disablePastDates || props.disableFutureDates) {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)

                  if (props.disablePastDates && date < today) return true
                  if (props.disableFutureDates && date > today) return true
                }

                return false
              }}
              id='calendar'
              initialFocus={true}
              mode='single'
              month={new Date(year, month)}
              selected={value}
              onMonthChange={handleMonthNavigation}
              onSelect={formatSelectedDate}
            />

            {props.includeTime && <TimePicker />}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
