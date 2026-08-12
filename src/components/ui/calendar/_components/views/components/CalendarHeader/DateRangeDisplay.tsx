import React from 'react';
import moment from 'moment-timezone';
import { TimelineGroup } from '../../_common/types';
import { getTimezoneAbbreviation } from '../../_common/utils';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';

interface DateRangeDisplayProps {
  uniqueDates: TimelineGroup[];
  numberOfDays?: number; // Optional prop for dynamic days display
}

const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({ uniqueDates, numberOfDays = 7 }) => {

  const {config} = useCalendarContext();
  const timezone = config?.timezone || 'UTC';

  if (!uniqueDates?.[0]?.date) {
    return <span>No dates available</span>;
  }
  

  // Calculate the date range based on numberOfDays
  const datesToShow = uniqueDates.slice(0, numberOfDays);
  const firstDate = moment.tz(datesToShow[0]?.date || '', timezone);
  const lastDate = moment.tz(datesToShow[datesToShow.length - 1]?.date || '', timezone);
  
  // Format the date range
  const formattedRange = `${firstDate.format('MMM D')} - ${lastDate.format('MMM D, YYYY')}`;
  
  return (
    <span className='text-sm'>
      {formattedRange} ({getTimezoneAbbreviation(timezone)})
    </span>
  );
};

export default DateRangeDisplay;