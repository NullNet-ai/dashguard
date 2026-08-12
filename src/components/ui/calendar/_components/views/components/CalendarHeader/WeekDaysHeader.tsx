import React from 'react';
import moment from 'moment-timezone';
import { cn } from '~/lib/utils';
import { TimelineGroup } from '../../_common/types';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';
import { calculateWeekOffsetForDate } from '../../utils/dateCalculations';

interface WeekDaysHeaderProps {
  weekOffset: number;
  hasEventsOnDate: (date: moment.Moment) => boolean;
  container: React.RefObject<HTMLDivElement>;
  newDates: TimelineGroup[];
  numberOfDays?: number; // Optional prop with default value of 7
}

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

function getGroupedDatesSorted( data:any) {
    const uniqueDates = [...new Set(data.map((item: any) => item.date))];
    
    // Sort dates chronologically using moment-timezone
    uniqueDates.sort((a, b) => moment.tz(a, moment.tz.guess()).valueOf() - moment.tz(b, moment.tz.guess()).valueOf());
    
    return uniqueDates.map(date => ({ date, timezone: moment.tz.guess() }));
}

const WeekDaysHeader: React.FC<WeekDaysHeaderProps> = ({
  weekOffset,
  hasEventsOnDate,
  container,
  newDates,
  numberOfDays = 7, // Default to 7 days if not provided
}) => {
  const __newdates = filterHoursBetweenPairedEvents(newDates);

  const { config, setWeekOffset } = useCalendarContext();

  const timezone = config?.timezone || 'UTC';

  const scrollToDate = (targetDate: moment.Moment) => {
    if (!container.current) {
      return;
    }

    const targetDateString = targetDate.format('YYYY-MM-DD');
    const targetTimezone = targetDate.tz();
    
    // Find the index of the target date in newDates, considering timezone
    let targetDateIndex = -1;
    
    // First, try to find exact match with both date and timezone
    const exactMatch = newDates.findIndex(group => 
      group.date === targetDateString && group.timezone === targetTimezone
    );
    
    if (exactMatch !== -1) {
      targetDateIndex = exactMatch;
    } else {
      // Fallback: find any group with the target date
      targetDateIndex = newDates.findIndex(group => group.date === targetDateString);
    }
    
    // If target date is not in the visible range, navigate to target week first
    if (targetDateIndex === -1) {
      const targetNumberOfDays = config?.headerNumberOfDays || 7;
      const targetWeekOffset = calculateWeekOffsetForDate(targetDateString, timezone, targetNumberOfDays);
      setWeekOffset(targetWeekOffset);
      
      // Wait for the navigation to complete, then scroll to the specific date
      setTimeout(() => {
        scrollToDateInView(targetDate);
      }, 300);
      return;
    }

    // If target date is visible, scroll directly
    scrollToDateInView(targetDate);
  };

  const scrollToDateInView = (targetDate: moment.Moment) => {
    if (!container.current) {
      return;
    }

    const targetDateString = targetDate.format('YYYY-MM-DD');
    const targetTimezone = targetDate.tz();
    
    // Use filtered dates for accurate scroll calculation
    const filteredDates = filterHoursBetweenPairedEvents(newDates);
    
    // Find the correct date group considering both date and timezone
    // If there are multiple groups with the same date but different timezones,
    // prioritize the one that matches the target timezone, or use the first one as fallback
    let targetDateIndex = -1;
    
    // First, try to find exact match with both date and timezone
    const exactMatch = filteredDates.findIndex(group => 
      group.date === targetDateString && group.timezone === targetTimezone
    );
    
    if (exactMatch !== -1) {
      targetDateIndex = exactMatch;
    } else {
      // Fallback: find any group with the target date
      targetDateIndex = filteredDates.findIndex(group => group.date === targetDateString);
    }
    
    if (targetDateIndex === -1) {
      return;
    }

    const dateHeaderHeight = 60;
    const hourHeight = 80;
    let scrollPosition = 0;

    // Add height for previous date groups using filtered data
    for (let i = 0; i < targetDateIndex; i++) {
      scrollPosition += dateHeaderHeight;
      // Only add hour heights if the date group has timeline hours
      const timelineLength = filteredDates[i]?.timeline?.length ?? 0;
      if (timelineLength > 0) {
        scrollPosition += timelineLength * hourHeight;
      }
    }

    // Add current date header
    scrollPosition += dateHeaderHeight;

    // Only calculate hour-based scroll if the target date has timeline hours
    const targetDateGroup = filteredDates[targetDateIndex];
    if (targetDateGroup?.timeline && targetDateGroup.timeline.length > 0) {
      const currentHour = moment().tz(targetTimezone || timezone).hour();
      const currentMinute = moment().tz(targetTimezone || timezone).minute();
      
      // Find the current hour in the filtered timeline
      const currentHourIndex = targetDateGroup.timeline.findIndex(hour => hour.hour === currentHour);
      
      if (currentHourIndex !== -1) {
        // Add hours before current hour in the filtered timeline
        scrollPosition += currentHourIndex * hourHeight;
        scrollPosition += (currentMinute / 60) * hourHeight;
      }
    }

    // Add some offset to show the date header clearly
    scrollPosition = scrollPosition - 100;
    
    // Smooth scroll to the target position
    container.current?.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  };

   const _newdates = getGroupedDatesSorted(newDates)

  return (
    <div className="mt-2 flex w-full flex-1 items-center justify-between  bg-slate-100">
      {Array.from({ length: numberOfDays }, (_, i) => {
        // Use the dates from newDates prop instead of manual calculation
        const dateGroup = _newdates[i];

        if (!dateGroup) return null;
        
        // Use the dateGroup's specific timezone if available, fallback to calendar timezone
        const dateTimezone = dateGroup.timezone || timezone;
        const date = moment.tz(dateGroup.date, dateTimezone);

        // Compare today using the same timezone as the date
        const isToday = moment().tz(dateTimezone).isSame(date, 'day');
        const hasEvent = hasEventsOnDate(date);

        return (
          <div
            key={i}
                  className={`flex flex-col items-center rounded-lg px-1 py-1`}
            style={{ width: `${100 / numberOfDays}%` }}
     
          >
            <span className="text-xs font-medium uppercase">
              {date.format('dd')}
            </span>
            <div
              onClick={() => scrollToDate(date)}
              className={cn(
                'mt-1 cursor-pointer transition-colors flex size-6 items-center justify-center rounded-full hover:bg-gray-200',
                {
                  'bg-primary/10': isToday,
                  'border border-dashed border-gray-300 bg-blue-100 dark:bg-blue-900':
                    hasEvent && !isToday,
                },
              )}
            >
              <span
                className={cn('text-xs font-semibold', {
                  'text-primary': isToday,
                  'text-default/70 dark:text-blue-300': hasEvent && !isToday,
                  'text-gray-500 dark:text-gray-400': !isToday && !hasEvent,
                })}
              >
                {date.format('DD')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekDaysHeader;