import { useState, useMemo, useEffect } from 'react';
import moment from 'moment-timezone';
import { calculateWeekOffsetForDate } from '../utils/dateCalculations';

interface UseCalendarNavigationProps {
  defaultDate?: string;
  timezone?: string;
  numberOfDays?: number;
}

export const useCalendarNavigation = ({ defaultDate, timezone = 'Asia/Manila', numberOfDays = 7 }: UseCalendarNavigationProps = {}) => {
  // Calculate initial week offset based on default date
  const initialWeekOffset = useMemo(() => {
    if (defaultDate) {
      // When defaultDate is provided, show the period containing that date (offset 0)
      return 0;
    }
    return 0;
  }, [defaultDate, timezone, numberOfDays]);
  
  const [weekOffset, setWeekOffset] = useState(initialWeekOffset);

  // Update weekOffset when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      // When defaultDate is provided, show the period containing that date (offset 0)
      setWeekOffset(0);
    }
  }, [defaultDate, timezone, numberOfDays]);

  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = (container?: React.RefObject<HTMLDivElement>) => {
    setWeekOffset((prev) => prev + 1);
    // Scroll back to top to reset the view
    if (container?.current) {
      container.current.scrollTop = 0;
    }
  };

  const goToCurrentWeek = () => {
    // Calculate the correct week offset for today's date
    const todayOffset = calculateWeekOffsetForDate(moment().tz(timezone).format('YYYY-MM-DD'), timezone, numberOfDays);
    setWeekOffset(todayOffset);
  };

  const setWeekOffsetValue = (offset: number | ((prev: number) => number)) => {
    if (typeof offset === 'function') {
      setWeekOffset((prev) => offset(prev));
    } else {
      setWeekOffset(offset);
    }
  };

  return {
    weekOffset,
    setWeekOffset: setWeekOffsetValue,
    handlePrevWeek,
    handleNextWeek,
    goToCurrentWeek,
  };
};