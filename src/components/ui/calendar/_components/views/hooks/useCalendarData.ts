import { useMemo } from 'react';
import moment from 'moment-timezone';
import {
  formatTimeInTimezone,
  generateHourlyTimeline,
  getTimezoneAbbreviation,
  mergeEventArrays,
} from '../_common/utils';
import { calculateWeekStart } from '../utils/dateCalculations';
import { GroupedEvent, TimelineGroup } from '../_common/types';

export const useCalendarData = (weekOffset: number, eventData: any[], calendarType?: 'calendar' | 'timeline', numberOfDays = 7, timezone = 'Asia/Manila', defaultDate?: string) => {
  // Get unique dates from events - updated to use weekOffset and start on Friday

  const viewType = calendarType || 'calendar';

  const groupedTimelines = useMemo(() => {
    const groups = new Map<string, TimelineGroup>();

    eventData.forEach((event) => {
      const eventDate = new Date(event.start);
      const eventInOwnTimezone = new Date(
        eventDate.toLocaleString('en-US', { timeZone: event.timezone }),
      );
      const year = eventInOwnTimezone.getFullYear();
      const month = String(eventInOwnTimezone.getMonth() + 1).padStart(2, '0');
      const day = String(eventInOwnTimezone.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const timezoneAbbrev = getTimezoneAbbreviation(event.timezone);
      const groupKey = `${dateStr}-${timezoneAbbrev}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          date: dateStr,
          timezone: event.timezone,
          timezoneAbbrev: timezoneAbbrev,
          displayDate: formatTimeInTimezone(event.start, event.timezone, 'date'),
          timeline: generateHourlyTimeline(dateStr, event.timezone),
          events: [],
          earliestEventTime: new Date(event.start).getTime(),
        });
      } else {
        const group = groups.get(groupKey)!;
        const eventTime = new Date(event.start).getTime();
        if (eventTime < group.earliestEventTime) {
          group.earliestEventTime = eventTime;
        }
      }

      const group = groups.get(groupKey)!;
      const eventWithDisplay: GroupedEvent = {
        ...event,
        pairEventData: eventData?.filter((item) => (item?.pairId === event?.pairId && item?.title !== event?.title))?.map((item) => ({
          ...item,
          displayTime: formatTimeInTimezone(item.start, item.timezone, 'time'),
          displayDate: formatTimeInTimezone(item.start, item.timezone, 'date'),
        })),
        displayTime: formatTimeInTimezone(event.start, event.timezone, 'time'),
        displayDate: formatTimeInTimezone(event.start, event.timezone, 'date'),
        hourPosition: eventInOwnTimezone.getHours(),
        exactMinutes: eventInOwnTimezone.getMinutes(),
      };
      group.events.push(eventWithDisplay);
    });

    return Array.from(groups.values()).sort((a, b) => {
      return a.earliestEventTime - b.earliestEventTime;
    });
  }, [eventData]);

  const uniqueDates = useMemo(() => {
    const startOfWeek = calculateWeekStart(weekOffset, timezone, numberOfDays, defaultDate);

    const weekDates = Array.from({ length: numberOfDays }, (_, i) => {
      const currentDate = startOfWeek.clone().add(i, 'days');
      const dateString = currentDate.format('YYYY-MM-DD');
      // Use the dynamic timezone parameter
      const timezoneAbbrev = getTimezoneAbbreviation(timezone);

      const timeline = Array.from({ length: 24 }, (_, hour) => {
        const hourMoment = currentDate
          .clone()
          .hour(hour)
          .minute(0)
          .second(0)
          .millisecond(0);
        return {
          hour,
          displayTime: hourMoment.format('hh:mm A'),
          timestamp: hourMoment.utc().toISOString(),
        };
      });

      return {
        date: dateString,
        timezone,
        timezoneAbbrev,
        displayDate: currentDate.format('MMMM D, YYYY'),
        timeline,
        events: [] as GroupedEvent[],
        earliestEventTime: currentDate.valueOf(),
      };
    });
    return weekDates;
  }, [weekOffset, numberOfDays, timezone, defaultDate]);

  const newDates = useMemo(() => {
    return mergeEventArrays(groupedTimelines, uniqueDates);
  }, [groupedTimelines, uniqueDates]);

  const hasEventsOnDate = (date: moment.Moment) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return eventData.some(
      (event) => moment(event.start).format('YYYY-MM-DD') === formattedDate,
    );
  };
  return {
    uniqueDates,
    newDates,
    hasEventsOnDate,
    groupedTimelines
  };
};