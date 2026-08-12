import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';
import { cn } from '~/lib/utils';
import { TimelineGroup } from '../../_common/types';
import { getEventLineColor } from '../../_common/utils';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';

interface DateHeaderProps {
  group: TimelineGroup;
  calendarType?: 'timeline' | 'calendar';
  previousGroup?: TimelineGroup | null;
  groupIndex?: number;
}

const DateHeader: React.FC<DateHeaderProps> = ({
  group,
  calendarType = 'calendar',
  previousGroup,
  groupIndex,
}) => {
  const [isStuck, setIsStuck] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {config} = useCalendarContext();
  const timezone = config?.timezone || 'UTC';
  
  const hasEvents = group.events.length > 0;
  const isToday = moment.tz(group.date, timezone).isSame(moment().tz(timezone), 'day'); 

  const previousLastEvent = previousGroup?.events
    ? previousGroup?.events[previousGroup.events.length - 1]
    : undefined;

  const prevLineType =
    previousLastEvent?.metadata?.lineType &&
    previousLastEvent?.metadata?.lineType === 'solid'
      ? 'border-solid'
      : 'border-dashed';

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible, header is stuck
        setIsStuck(!entry?.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px'
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element positioned just above the sticky header */}
      <div ref={sentinelRef} className="h-0 w-full" style={{ marginTop: '-1px' }} />
      
      <div 
        ref={headerRef}
        className={cn(
          "sticky top-0 z-20 w-[148px] flex-shrink-0",
        )}
      >
        <div
          className={cn(
            'inline-block w-full max-w-[125px] rounded-r-full bg-slate-300 px-2 py-2 text-xs text-default/80',
            hasEvents &&
              calendarType === 'calendar' &&
              'border-2 border-l-0 border-dashed border-blue-400 bg-cyan-100 text-[#3b7d98]',
            // isStuck && 'bg-blue-200', // Different styling when stuck
            isToday && 'bg-blue-100 border-blue-100 text-primary font-bold' // Highlight today's date
          )}
        >
          <span className="font-semibold">
              {moment.tz(group.date, timezone).format('MMM DD')}
          </span>{' '}
          - ({group.timezoneAbbrev})
        </div>
        {groupIndex !== 0 && !isStuck && (
          <div
            className={cn(
              `absolute right-0 top-0 h-full w-0.5 border-r-2 border-dashed border-warning/55`,
              prevLineType,
            )}
          />
        )}
      </div>
    </>
  );
};

export default DateHeader;
