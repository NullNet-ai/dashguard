import React from 'react';
import { cn } from '~/lib/utils';

interface TimeColumnProps {
  displayTime: string;
  isCurrentHour: boolean;
  hasEventInTheHour?: boolean;
  calendarType?: 'timeline' | 'calendar';
  eventsForHour?: any;
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  displayTime,
  isCurrentHour,
  calendarType,
  hasEventInTheHour,
  eventsForHour,
}) => {
  return (
    <div
      className={cn(
        'w-[140px] flex-shrink-0 pr-6 text-right',
        {
          'opacity-0': !hasEventInTheHour && calendarType === 'timeline',
        },
        { 'relative top-[-5px]': !eventsForHour?.length && calendarType === 'calendar' && displayTime !== '12:00 AM', },
        {
          'relative top-[5px]': hasEventInTheHour && eventsForHour?.length,
        },
      )}
    >
      <div
        className={cn(
          'text-sm font-medium',
          isCurrentHour ? 'text-blue-600' : 'text-gray-700',
        )}
      >
        {displayTime}
      </div>
    </div>
  );
};

export default TimeColumn;
