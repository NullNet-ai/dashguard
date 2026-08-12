import { DayData, type TimelineGroup } from './types';

export const getEventLineColor = (
  color: 'warning' | 'secondary' | 'primary' | undefined,
) => {
  switch (color) {
    case 'warning':
      return 'border-warning/50';
    case 'secondary':
      return 'border-secondary/50';
    case 'primary':
      return 'border-primary/50';
    default:
      return 'border-warning/50';
  }
};
export const getIconColor = (
  color: 'warning' | 'secondary' | 'primary' | undefined,
) => {
  switch (color) {
    case 'warning':
      return 'bg-warning';
    case 'secondary':
      return 'bg-gray-400';
    case 'primary':
      return 'bg-primary';
    default:
      return 'bg-primary';
  }
};

// Utility functions
export const formatTimeInTimezone = (
  dateStr: string,
  timezone: string,
  format: 'time' | 'date' | 'datetime' = 'datetime',
) => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    ...(format === 'time' && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    ...(format === 'date' && {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    ...(format === 'datetime' && {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };

  return date.toLocaleString('en-US', options);
};

export const getTimezoneAbbreviation = (timezone: string) => {
  const timezoneMap: { [key: string]: string } = {
    // Asia - Use GMT+X format
    'Asia/Manila': 'GMT+8',
    'Asia/Taipei': 'GMT+8',
    'Asia/Tokyo': 'GMT+9',
    'Asia/Shanghai': 'GMT+8',
    'Asia/Hong_Kong': 'GMT+8',
    'Asia/Singapore': 'GMT+8',
    'Asia/Seoul': 'GMT+9',
    'Asia/Bangkok': 'GMT+7',
    'Asia/Jakarta': 'GMT+7',
    'Asia/Kuala_Lumpur': 'GMT+8',
    'Asia/Kolkata': 'GMT+5:30',
    'Asia/Dubai': 'GMT+4',
    'Asia/Riyadh': 'GMT+3',
    
    // Europe - Use GMT/CET/EET
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Europe/Rome': 'CET',
    'Europe/Madrid': 'CET',
    'Europe/Amsterdam': 'CET',
    'Europe/Brussels': 'CET',
    'Europe/Vienna': 'CET',
    'Europe/Zurich': 'CET',
    'Europe/Stockholm': 'CET',
    'Europe/Oslo': 'CET',
    'Europe/Copenhagen': 'CET',
    'Europe/Helsinki': 'EET',
    'Europe/Athens': 'EET',
    'Europe/Istanbul': 'GMT+3',
    'Europe/Moscow': 'GMT+3',
    
    // North America - Use PST/PDT, EST/EDT, CST/CDT, MST/MDT
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'America/Phoenix': 'MST',
    'America/Anchorage': 'AKST',
    'America/Honolulu': 'HST',
    'America/Toronto': 'EST',
    'America/Vancouver': 'PST',
    'America/Montreal': 'EST',
    
    // Central/South America - Use GMT-X format
    'America/Mexico_City': 'GMT-6',
    'America/Bogota': 'GMT-5',
    'America/Lima': 'GMT-5',
    'America/Santiago': 'GMT-3',
    'America/Buenos_Aires': 'GMT-3',
    'America/Sao_Paulo': 'GMT-3',
    'America/Caracas': 'GMT-4',
    
    // Australia/Oceania - Use GMT+X format
    'Australia/Sydney': 'GMT+11',
    'Australia/Melbourne': 'GMT+11',
    'Australia/Brisbane': 'GMT+10',
    'Australia/Perth': 'GMT+8',
    'Australia/Adelaide': 'GMT+10:30',
    'Pacific/Auckland': 'GMT+13',
    'Pacific/Fiji': 'GMT+12',
    
    // Africa - Use GMT+X format
    'Africa/Cairo': 'GMT+2',
    'Africa/Johannesburg': 'GMT+2',
    'Africa/Lagos': 'GMT+1',
    'Africa/Nairobi': 'GMT+3',
    'Africa/Casablanca': 'GMT+1',
    
    // UTC and others
    'UTC': 'UTC',
    'GMT': 'GMT',
  };
  return timezoneMap[timezone] || timezone;
};

export const generateHourlyTimeline = (date: string, timezone: string) => {
  const timeline = [];

  // Create start of day in the specific timezone
  const startOfDay = new Date(`${date}T00:00:00`);

  for (let hour = 0; hour < 24; hour++) {
    const currentHour = new Date(startOfDay);
    currentHour.setHours(hour);

    timeline.push({
      hour,
      displayTime: currentHour.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      timestamp: currentHour.toISOString(),
    });
  }

  return timeline;
};


// Filter out time slots that fall between paired events
export const filterTimeSlotsBetweenPairedEvents = (timeSlots: any[], events: any[], currentDate: string) => {
  // Get all events with pairId
  const pairedEvents = events.filter((event: any) => event.pairId);
  
  if (pairedEvents.length === 0) {
    return timeSlots;
  }

  // Group events by pairId
  const eventPairs = new Map<string, any[]>();
  pairedEvents.forEach((event: any) => {
    const pairId = event.pairId;
    if (!eventPairs.has(pairId)) {
      eventPairs.set(pairId, []);
    }
    eventPairs.get(pairId)?.push(event);
  });

  // Find time ranges to exclude
  const excludedHours = new Set<number>();
  
  eventPairs.forEach((events: any[]) => {
    if (events.length >= 2) {
      // Sort events by start time
      events.sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
      
      for (let i = 0; i < events.length - 1; i++) {
        const startEvent = events[i];
        const endEvent = events[i + 1];
        
        if (!startEvent?.start || !endEvent?.start) continue;
        
        const startTime = new Date(startEvent.start);
        const endTime = new Date(endEvent.start);
        
        // Check if both events are on the same date as currentDate
        const startDate = startTime.toISOString().split('T')[0];
        const endDate = endTime.toISOString().split('T')[0];
        
        if (startDate && endDate) {
          if (startDate === currentDate && endDate === currentDate) {
            // Same day - exclude hours between events
            const startHour = startTime.getHours();
            const endHour = endTime.getHours();
            
            for (let hour = startHour + 1; hour < endHour; hour++) {
              excludedHours.add(hour);
            }
          } else if (startDate === currentDate && endDate > currentDate) {
            // Start event is today, end event is later - exclude hours after start event
            const startHour = startTime.getHours();
            for (let hour = startHour + 1; hour < 24; hour++) {
              excludedHours.add(hour);
            }
          } else if (startDate < currentDate && endDate === currentDate) {
            // Start event was earlier, end event is today - exclude hours before end event
            const endHour = endTime.getHours();
            for (let hour = 0; hour < endHour; hour++) {
              excludedHours.add(hour);
            }
          } else if (startDate < currentDate && endDate > currentDate) {
            // Current date is between start and end - exclude all hours
            for (let hour = 0; hour < 24; hour++) {
              excludedHours.add(hour);
            }
          }
        }
      }
    }
  });

  // Filter out excluded hours
  return timeSlots.filter((timeSlot: any) => !excludedHours.has(timeSlot.hour));
};

export function mergeEventArrays(eventsArray: TimelineGroup[], daysOfWeekArray: TimelineGroup[]): TimelineGroup[] {
    // Create a map to group by date and timezone abbreviation
    const mergedMap = new Map<string, TimelineGroup>();
    
    // Helper function to create a unique key for date and timezone abbreviation
    const createKey = (date: string, timezoneAbbrev: string): string => `${date}_${timezoneAbbrev}`;
    
    // Create a set of valid dates from daysOfWeekArray for quick lookup
    const validDates = new Set(daysOfWeekArray.map(day => day.date));
    
    // Process daysOfWeek array first (as base structure)
    daysOfWeekArray.forEach(day => {
      const key = createKey(day.date, day.timezoneAbbrev);
      mergedMap.set(key, {
        ...day,
        events: [...day.events] // Copy existing events
      });
    });
    
    // Process events array and merge with existing entries or create new ones
    eventsArray.forEach(eventDay => {
      const key = createKey(eventDay.date, eventDay.timezoneAbbrev);
      
      if (mergedMap.has(key)) {
        // Merge events into existing day (matching date and timezone abbreviation)
        const existingDay = mergedMap.get(key)!;
        existingDay.events = [...existingDay.events, ...eventDay.events];
        
        // Update earliestEventTime
        existingDay.earliestEventTime = eventDay.earliestEventTime;
      } else if (validDates.has(eventDay.date)) {
        // Add new entry for events with different timezone but valid date
        mergedMap.set(key, {
          ...eventDay,
          events: [...eventDay.events]
        });
      }
      // Events outside the week date range are ignored
    });
    
    // Convert map back to array and sort by date
    return Array.from(mergedMap.values()).sort((a, b) => {
      // Sort by earliestEventTime
      return a.earliestEventTime - b.earliestEventTime;
    });
}
  