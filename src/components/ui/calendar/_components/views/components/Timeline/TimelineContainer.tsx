import React, { useEffect, useCallback, useRef } from 'react';
import DateGroup from './DateGroup';
import {
  ICalendarProps,
  TEventComponent,
  TimelineGroup,
} from '../../_common/types';
import { cn } from '~/lib/utils';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';

interface TimelineContainerProps
  extends Omit<ICalendarProps, 'events' | 'viewType'> {
  container: React.RefObject<HTMLDivElement>;
  newDates: TimelineGroup[];
  calendarType?: 'timeline' | 'calendar';
  eventComponents?: TEventComponent[];
  onClickEvent?: (event: any) => void;
  timelineHeight?: string;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  container,
  newDates,
  calendarType = 'calendar',
  eventComponents,
  timelineHeight,
  ...rest
}) => {
  const { handleNextWeek, config } = useCalendarContext();
  const isScrollingRef = useRef(false);

  // Filter hours between paired events within each date
  const filterHoursBetweenPairedEvents = (dates: TimelineGroup[]) => {
    // First, collect all paired events across all dates
    const allPairedEvents: any[] = [];
    dates.forEach(group => {
      const pairedEvents = group.events.filter((event: any) => event.pairId);
      allPairedEvents.push(...pairedEvents);
    });

    // Group all paired events by pairId
    const globalEventPairs = new Map<string, any[]>();
    allPairedEvents.forEach((event: any) => {
      const pairId = event.pairId;
      if (!globalEventPairs.has(pairId)) {
        globalEventPairs.set(pairId, []);
      }
      globalEventPairs.get(pairId)?.push(event);
    });

    // Now process each date group
    return dates.map(group => {
      const excludedHours = new Set<number>();
      
      // Check all global pairs to see if they affect this date
      globalEventPairs.forEach((events: any[]) => {
        if (events.length >= 2) {
          // Sort events by start time
          events.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
          
          const firstEvent = events[0];
          const lastEvent = events[events.length - 1];
          
          if (!firstEvent?.start || !lastEvent?.start) return;
          
          // Convert events to their respective timezones for accurate date/time comparison
          const startEventInTimezone = new Date(new Date(firstEvent.start).toLocaleString('en-US', { timeZone: firstEvent.timezone || 'UTC' }));
          const endEventInTimezone = new Date(new Date(lastEvent.start).toLocaleString('en-US', { timeZone: lastEvent.timezone || 'UTC' }));
          
          // Get dates in respective timezones
          const startYear = startEventInTimezone.getFullYear();
          const startMonth = String(startEventInTimezone.getMonth() + 1).padStart(2, '0');
          const startDay = String(startEventInTimezone.getDate()).padStart(2, '0');
          const startDate = `${startYear}-${startMonth}-${startDay}`;
          
          const endYear = endEventInTimezone.getFullYear();
          const endMonth = String(endEventInTimezone.getMonth() + 1).padStart(2, '0');
          const endDay = String(endEventInTimezone.getDate()).padStart(2, '0');
          const endDate = `${endYear}-${endMonth}-${endDay}`;
          
          // Convert current group date to the group's timezone for comparison
          const groupEventInTimezone = new Date(new Date(`${group.date}T00:00:00`).toLocaleString('en-US', { timeZone: group.timezone || 'UTC' }));
          const groupYear = groupEventInTimezone.getFullYear();
          const groupMonth = String(groupEventInTimezone.getMonth() + 1).padStart(2, '0');
          const groupDay = String(groupEventInTimezone.getDate()).padStart(2, '0');
          const groupDateInTimezone = `${groupYear}-${groupMonth}-${groupDay}`;
          
          if (startDate && endDate) {
            if (startDate === groupDateInTimezone && endDate === groupDateInTimezone) {
              // Same day - exclude hours between events (using timezone-specific hours)
              const startHour = startEventInTimezone.getHours();
              const endHour = endEventInTimezone.getHours();
              
              for (let hour = startHour + 1; hour < endHour; hour++) {
                excludedHours.add(hour);
              }
            } else if (startDate === groupDateInTimezone && endDate > groupDateInTimezone) {
              // Start event is today, end event is later - exclude hours after start event
              const startHour = startEventInTimezone.getHours();
              for (let hour = startHour + 1; hour < 24; hour++) {
                excludedHours.add(hour);
              }
            } else if (startDate < groupDateInTimezone && endDate === groupDateInTimezone) {
              // Start event was earlier, end event is today - exclude hours before end event
              const endHour = endEventInTimezone.getHours();
              for (let hour = 0; hour < endHour; hour++) {
                excludedHours.add(hour);
              }
            } else if (startDate < groupDateInTimezone && endDate > groupDateInTimezone) {
              // Current date is between start and end - exclude all hours
              for (let hour = 0; hour < 24; hour++) {
                excludedHours.add(hour);
              }
            }
          }
        }
      });

      // Filter timeline to exclude hours between paired events
      const filteredTimeline = group.timeline.filter((timeSlot: any) => !excludedHours.has(timeSlot.hour));
      
      // Filter events that fall in excluded hours (but keep paired events that are start/end points)
      const filteredEvents = group.events.filter((event: any) => {
        if (!event.pairId) return true; // Keep non-paired events
        
        // Keep events that are start or end points of pairs
        const pairEvents = globalEventPairs.get(event.pairId) || [];
        if (pairEvents.length >= 2) {
          const sortedPair = pairEvents.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
          const isStartOrEnd = event.id === sortedPair[0].id || event.id === sortedPair[sortedPair.length - 1].id;
          if (isStartOrEnd) return true;
        }
        
        // Filter out events in excluded hours
        return !excludedHours.has(event.hourPosition);
      });

      return {
        ...group,
        timeline: filteredTimeline,
        events: filteredEvents
      };
    });
  };

  // Apply pair-based filtering first, then calendar type filtering
  const pairFilteredDates = filterHoursBetweenPairedEvents(newDates);
  const newfiltedDates = calendarType === 'calendar' ? pairFilteredDates : pairFilteredDates.filter((group) => group.events.length > 0)

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!config?.isInfinite || !container.current || isScrollingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container.current;
    const scrollThreshold = 50; // Trigger when 50px from bottom

    // Check if user has scrolled to near the bottom
    if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
      isScrollingRef.current = true;
      
      // Navigate to next time span
      handleNextWeek();
      
      // Scroll back to top after a short delay to allow content to update
      setTimeout(() => {
        if (container.current) {
          container.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
        // Reset the flag after scrolling is complete
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300); // Allow time for smooth scroll to complete
      }, 100);
    }
  }, [config?.isInfinite, container, handleNextWeek]);

  // Add scroll event listener
  useEffect(() => {
    if (!config?.isInfinite || !container.current) return;

    const containerElement = container.current;
    containerElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      containerElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, config?.isInfinite]);


  return (
    <div
      ref={container}
      className={cn(
        `overflow-auto bg-white px-2 w-full flex-1 ${timelineHeight}`,
        `${calendarType === 'calendar' ? 'h-[calc(100dvh-230px)]' : 'h-[calc(100dvh-171px)]'}`,
      )}
            style={{
        ...(timelineHeight && { height: timelineHeight }),
      }}
    >
      <div className="relative">
        {newfiltedDates.map((group, groupIndex) => {
          const previousGroup =
            groupIndex === 0 ? null : newDates[groupIndex - 1];
          return (
            <DateGroup
              key={group.date.toString() + groupIndex}
              group={group}
              previousGroup={previousGroup}
              calendarType={calendarType}
              groupIndex={groupIndex}
              eventComponents={eventComponents}
              {...rest}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TimelineContainer;
