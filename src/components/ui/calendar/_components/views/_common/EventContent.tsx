import React from 'react';
import moment from 'moment-timezone';
import { cn } from '~/lib/utils';
import { getEventLineColor, getIconColor } from './utils';
import { type TEventComponent } from './types';
import DefaultEvent from '../components/view/DefaultEvent';
import { useCalendarContext } from '../../../views/CalendarProvider';

interface EventContentProps {
  eventsForHour: any[];
  hourIndex: number;
  isLastHour: boolean;
  isLastDate: boolean;
  calendarType?: 'calendar' | 'timeline';
  previousGroup: any;
  previousTimeSlot: any;
  hasEventInTheHour: boolean;
  eventComponents?: TEventComponent[];
  onEventClick?: (event: any) => void;
  allEventsInTimeline?: any[]; // Add this to pass all events for pair detection
}

const EventContent = ({
  eventsForHour,
  hourIndex,
  isLastHour,
  isLastDate,
  calendarType = 'calendar',
  previousGroup,
  previousTimeSlot,
  hasEventInTheHour,
  eventComponents,
  onEventClick,
  allEventsInTimeline = []
}: EventContentProps) => {
  const { config } = useCalendarContext();

  const timezone = config?.timezone;

  const checkEventIfStartedWithOutMinutes = eventsForHour?.some(
    (event: any) => {
      const eventTime = moment.tz(event.start, timezone || 'UTC');
      const eventStartTime = eventTime.format('mm');
      return eventStartTime === '00';
    },
  );

  const previousLastEvent = previousGroup?.events
    ? previousGroup.events
        .slice() // Create a copy to avoid mutating original array
        .sort(
          (a: any, b: any) =>
            moment(b.start).valueOf() - moment(a.start).valueOf(),
        )[0] // Sort by date descending and get the latest
    : undefined;

  const lastEventLine = previousTimeSlot?.events
    ? previousTimeSlot.events
        .slice() // Create a copy to avoid mutating original array
        .sort(
          (a: any, b: any) =>
            moment(b.start).valueOf() - moment(a.start).valueOf(),
        )[0] // Sort by date descending and get the latest
    : undefined;

  const prevLineType =
    hourIndex === 0
      ? previousLastEvent?.metadata?.lineType &&
        previousLastEvent?.metadata?.lineType === 'solid'
        ? 'border-solid'
        : 'border-dashed'
      : lastEventLine?.metadata?.lineType
        ? lastEventLine.metadata.lineType
        : 'border-dashed';

  return (
    <div className={cn('relative ml-4 h-full min-h-[80px] flex-1', {
      'pt-1': calendarType === 'calendar',
    })}>
      <span className="absolute hidden h-0 w-0 border-warning/50 bg-default/50" />
      {!eventsForHour?.length ? (
        <div
          className={cn(
            'absolute left-[-10px] top-0 h-full w-0.5 border-l-2 border-dashed border-warning/55',
          )}
        />
      ) : null}

      {eventsForHour.length > 0 ? (
        <>
          {(!checkEventIfStartedWithOutMinutes && !hasEventInTheHour && calendarType==='timeline' && hourIndex ===0) || (!checkEventIfStartedWithOutMinutes && calendarType==='calendar') ? (
            <div className="min-h-[30px]">
              <div
                className={cn(
                  'absolute left-[-10px] h-[30px] w-0.5 border-l-2',
                  prevLineType,
                  `border-warning/55`,
                  hourIndex === 0 ? 'top-0' : '-',
                  // isLastHour && isLastDate ? "h-16" : "h-[70px]"
                )}
              />
              
            </div>
          ) : null}

          {eventsForHour.map((event: any, eventIndex: number) => {
            let EventComponent: TEventComponent;

            if (eventComponents && eventComponents.length > 0) {
              // Find component by displayName from event metadata
              const componentName = event.metadata?.component;
              if (componentName) {
                // Find matching component by displayName (production-safe)
                const matchingComponent = eventComponents.find(
                  (comp) => comp.displayName === componentName || comp.name === componentName
                );
                EventComponent = matchingComponent || DefaultEvent;
              } else {
                // Use first component if no component name specified
                EventComponent = eventComponents[0] || DefaultEvent;
              }
            } else {
              // Fallback to DefaultEvent when no eventComponents provided
              EventComponent = DefaultEvent;
            }

            return (
              <>
                <EventComponent
                  timezone={timezone}
                  key={event.id}
                  event={event}
                  hourIndex={hourIndex}
                  eventIndex={eventIndex}
                  totalEventsInHour={eventsForHour.length}
                  calenderType={calendarType}
                  previousGroup={previousGroup}
                  allEventsInTimeline={allEventsInTimeline}
                  onEventClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                />
              </>
            );
          })}
        </>
      ) : (
        <div className="pt-2 text-xs italic text-gray-400">
          {/* Empty hour slot */}
        </div>
      )}
    </div>
  );
};

export default EventContent;
