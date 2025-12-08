import React from 'react';
import moment from 'moment';
import TimeColumn from './TimeColumn';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import EventContent from '../../_common/EventContent';
import {
  ICalendarProps,
  TEventComponent,
  TimelineGroup,
} from '../../_common/types';
import { cn } from '~/lib/utils';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';

interface HourSlotProps extends Omit<ICalendarProps, 'events' | 'viewType'> {
  timeSlot: {
    hour: number;
    displayTime: string;
    timestamp: string;
  };
  group: TimelineGroup;
  hourIndex: number;
  calendarType?: 'timeline' | 'calendar';
  previousGroup?: TimelineGroup | null;
  previousTimeSlot?: any;
  eventComponents?: TEventComponent[];
}

const HourSlot: React.FC<HourSlotProps> = ({
  timeSlot,
  group,
  hourIndex,
  calendarType = 'calendar',
  previousGroup,
  previousTimeSlot,
  eventComponents,
  onDayClick,
  onEventClick
}) => {
  const { config } = useCalendarContext();
  const timezone = config?.timezone || 'Asia/Manila';
  
  const eventsForHour = group.events.filter(
    (event) => event.hourPosition === timeSlot.hour,
  );
  const isCurrentHour =
    moment().tz(timezone).format('YYYY-MM-DD') === group.date &&
    moment().tz(timezone).hour() === timeSlot.hour;

  // Calculate dynamic height based on events
  const calculateMinHeight = () => {
    if (eventsForHour.length === 0) {
      return 80; // Default height when no events
    }

    // Find the event with the latest minute position
    const maxMinute = Math.max(
      ...eventsForHour.map((event) => event.exactMinutes),
    );
    const hourBlockHeight = 80;
    const eventPosition = (maxMinute / 60) * hourBlockHeight;

    // Add some padding for the event content (estimated 100px for event height)
    const eventContentHeight = 100;
    const requiredHeight = eventPosition + eventContentHeight;

    // Ensure minimum height of 80px
    return Math.max(80, requiredHeight);
  };

  const minHeight = calculateMinHeight();

  const checkEventIfStartedWithOutMinutes = eventsForHour?.some(
    (event: any) => {
      const eventTime = moment(event.start);
      const eventStartTime = eventTime.format('mm');
      return eventStartTime === '00';
    },
  );

  const hasEventInTheHour = eventsForHour.some((event) => {
    const timeSlotDateTime = timeSlot.displayTime;
    const eventDateTime = event.displayTime;
    return timeSlotDateTime === eventDateTime;
  });


  return (
    <div
      className={cn(
        `relative flex items-start`,
        `${calendarType === 'calendar' ? 'mb-[2px]' : ''}`,
      )}
      style={{
        minHeight: eventsForHour.length === 0 ? `${minHeight}px` : '80px',
      }}
    >
      <TimeColumn
        displayTime={timeSlot.displayTime}
        isCurrentHour={isCurrentHour}
        hasEventInTheHour={hasEventInTheHour}
        calendarType={calendarType}
        eventsForHour={eventsForHour}
      />
      <div
        className="relative flex-1 cursor-pointer"
        style={{
          minHeight: eventsForHour.length === 0 ? `${minHeight}px` : '80px',
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const hourHeight = rect.height;

          // Calculate minutes based on click position (0-59 minutes)
          const minutes = Math.floor((clickY / hourHeight) * 60);

          // Create the date-time string with the calculated minutes
          const baseDateTime = moment(timeSlot.timestamp);
          const clickDateTime = baseDateTime
            .clone()
            .minute(minutes)
            .second(0)
            .millisecond(0);

          // Check if click was on an event
          let clickedEvent = null;
          const target = e.target as HTMLElement;
          
          // Look for event container in the clicked element or its parents
          const eventElement = target.closest('[data-event-id]');
          if (eventElement) {
            const eventId = eventElement.getAttribute('data-event-id');
            clickedEvent = eventsForHour.find(event => event.id === eventId);
          }

          if(eventElement) {
            e.stopPropagation();
            if (clickedEvent) onEventClick?.(clickedEvent);
            return 
          }

          onDayClick?.({
            date: clickDateTime.format('YYYY-MM-DD'),
            time: clickDateTime.format('HH:mm'),
            fullDateTime: clickDateTime.format('YYYY-MM-DD HH:mm:ss'),
            timezone: group.timezone,
            clickPosition: {
              y: clickY,
              minutes: minutes,
              hourHeight: hourHeight,
            },
            event: clickedEvent || undefined,
          })

          console.info('Clicked date and time:', {
            date: clickDateTime.format('YYYY-MM-DD'),
            time: clickDateTime.format('HH:mm'),
            fullDateTime: clickDateTime.format('YYYY-MM-DD HH:mm:ss'),
            timezone: group.timezone,
            clickPosition: {
              y: clickY,
              minutes: minutes,
              hourHeight: hourHeight,
            },
            event: clickedEvent || undefined,
          });
        }}
      >
        {/* Gray lines for hours without events */}
        {(eventsForHour.length === 0 || !checkEventIfStartedWithOutMinutes) &&
          calendarType === 'calendar' && (
            <>
              <div
                className="absolute left-4 right-0 h-px border-t border-solid bg-gray-200"
                style={{ top: '0px' }}
              />
              {eventsForHour.length === 0 && (
                <div
                  className="absolute left-4 right-0 h-px border-t border-dashed bg-gray-50"
                  style={{ top: '40px' }}
                />
              )}
            </>
          )}

        {calendarType === 'calendar' ? (
          <CurrentTimeIndicator isCurrentHour={isCurrentHour} timezone={timezone} />
        ) : null}
        <EventContent
          previousGroup={previousGroup}
          calendarType={calendarType}
          eventsForHour={eventsForHour}
          hourIndex={hourIndex}
          previousTimeSlot={previousTimeSlot}
          hasEventInTheHour={hasEventInTheHour}
          eventComponents={eventComponents}
          isLastHour={false} // Add missing prop
          isLastDate={false} // Add missing prop
          allEventsInTimeline={group.events} // Pass all events for pair detection
          // onEventClick={onEventClick}
        />
      </div>
    </div>
  );
};

export default HourSlot;
