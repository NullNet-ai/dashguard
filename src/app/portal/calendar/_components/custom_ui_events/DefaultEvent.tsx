'use client'

import React from 'react';
import moment from 'moment-timezone';
import { GroupedEvent } from '~/components/ui/calendar/_components/views/_common/types';
import { getEventLineColor, getIconColor } from '~/components/ui/calendar/_components/views/_common/utils';
import { Car, Home, Plane } from 'lucide-react';
import { cn } from '~/lib/utils';

interface Props {
  event: GroupedEvent;
  hourIndex: number;
  eventIndex?: number;
  totalEventsInHour?: number;
  calenderType?: 'timeline' | 'calendar';
  previousGroup?: GroupedEvent | null;
  timezone?: string;
  allEventsInTimeline?: GroupedEvent[]; // Add this to check for paired events
}

const DefaultEvent = ({ event, hourIndex, eventIndex = 0, totalEventsInHour = 1, calenderType, timezone, allEventsInTimeline = [] }: Props) => {
  const eventTime = moment.tz(event.start, timezone || 'UTC');
  const additionalTime = event.metadata?.additionalTime
    ? moment.tz(event.metadata.additionalTime, timezone || 'UTC')
    : null;

  const borderType =
    event?.metadata?.lineType === 'solid' ? 'border-solid' : 'border-dashed';

  // Calculate the exact position based on minutes
  // Assuming each hour slot is 80px tall (min-h-[80px])
  const hourBlockHeight = 80;
  const minutePosition = (event.exactMinutes / 60) * hourBlockHeight;
  
  // Always use full width for events
  const eventWidth = '100%';
  const leftOffset = '0%';

  // Check if this event is the end of a pair (has pairId and is the later event in the pair)
  const isPairEndEvent = () => {
    if (!event.pairId) return false;
    
    const pairedEvents = allEventsInTimeline.filter(e => e.pairId === event.pairId);
    if (pairedEvents.length !== 2) return false;
    
    // Sort by start time and check if this is the second (end) event
    const sortedPair = pairedEvents.sort((a, b) => 
      moment.tz(a.start, timezone || 'UTC').valueOf() - moment.tz(b.start, timezone || 'UTC').valueOf()
    );
    
    return sortedPair[1]?.id === event.id;
  };

  const isEndOfPair = isPairEndEvent();

  return (
    <div 
      key={event.id} 
      className={cn(
        "pl-6 last:mb-0 relative",
        isEndOfPair ? "mb-8" : "" // Add spacing after paired events
      )}
      style={{ 
        // top: `${minutePosition}px`,
        // left: leftOffset,
        width: eventWidth
      }}
    >
      <div
        className={cn(
          'absolute left-[-10px] h-full w-0.5 border-l-2',
          `${borderType}`,
          `${getEventLineColor(event?.metadata?.lineColor)}`,
          hourIndex === 0 ? 'top-0' : '-',
          // isLastHour && isLastDate ? "h-16" : "h-[70px]"
        )}
      />
      <div
        className={cn(
          'absolute left-[-26px] top-0 flex size-8 items-center justify-center rounded-full border-4 border-gray-300',
          `${getIconColor(event?.metadata?.iconColor)}`,
        )}
      >
        <Home className="size-4 text-white" />
      </div>

      {event.metadata?.duration && (
        <div className='flex gap-1'>
        <Car className="size-4 text-warning" /> 
            <h3 className="text-sm text-warning">{event?.metadata?.duration}</h3>
        </div>
      )}
      
      {eventTime.format('mm') !== '00' && (
        <div className={cn(`mb-2 flex flex-col items-center gap-1 text-sm`, 
          `${eventTime.format('mm') !== '00' ? "absolute left-[-98px] top-[5px]" : ""}`
        )}>
          <span className="text-gray-700 font-medium">
            {eventTime.format('hh:mm A')}
          </span>
          {additionalTime && (
            <div>
              <span className="text-orange-600">
                {additionalTime.format('h:mm A')}
              </span>
            </div>
          )}
        </div>
      )}
      
      
      <div className={cn(` bg-orange-50 p-4 rounded-md lg:max-w-[50%]`,
        `${calenderType==='calendar'? "mb-2" : ""}`
      )}>
        <h3 className="mb-1 text-md text-gray-900">{event.title}</h3>
        <p className="mb-2 text-sm text-gray-600">{event.subTitle}</p>
      </div>
    </div>
  );
};

DefaultEvent.displayName = 'DefaultEvent';

export default DefaultEvent;
