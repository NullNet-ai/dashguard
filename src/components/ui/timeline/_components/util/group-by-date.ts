'use client'

import moment from 'moment-timezone';

/**
 * Gets the user's browser timezone with fallback detection
 * Prioritizes browser's Intl.DateTimeFormat for accuracy
 * @returns The detected timezone (e.g., 'Asia/Manila' for Philippines)
 */
function getBrowserTimezone(): string {
  try {
    // Primary: Use browser's Intl API for most accurate timezone detection
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Validate the timezone with moment-timezone
    if (moment.tz.zone(browserTimezone)) {
      return browserTimezone;
    }
    
    // Fallback: Use moment's timezone guess
    const momentGuess = moment.tz.guess();
    if (momentGuess) {
      return momentGuess;
    }
    
    // Final fallback: Use timezone offset to determine likely timezone
    const offset = new Date().getTimezoneOffset();
    
    // Philippines is UTC+8 (offset -480 minutes)
    if (offset === -480) {
      return 'Asia/Manila';
    }
    
    // Default fallback
    return 'UTC';
  } catch (error) {
    console.warn('Error detecting timezone:', error);
    // Emergency fallback for Philippines timezone
    const offset = new Date().getTimezoneOffset();
    return offset === -480 ? 'Asia/Manila' : 'UTC';
  }
}

/**
 * Groups data by date and timezone
 * @param data Array of objects containing timestamp field
 * @param timestampField The field name that contains the timestamp (default: 'timestamp')
 * @returns Array of grouped data by date
 */
export interface GroupedByDateResult<T> {
  date: string;
  timezone: string;
  data: T[];
}

export function groupByDate<T extends Record<string, any>>(
  data: T[],
  timestampField: keyof T = 'record_updated_date'
): GroupedByDateResult<T>[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Group data by date
  const grouped = data.reduce((acc, item) => {
    const dateValue = item[timestampField];
    
    if (!dateValue) {
      return acc;
    }

    // Parse date in MM/DD/YYYY format
    const momentObj = moment(dateValue, 'MM/DD/YYYY');
    if (!momentObj.isValid()) {
      return acc;
    }
    
    // Format date for display and grouping
    const dateString = momentObj.format('MMMM D, YYYY');
    
    // Use browser timezone for display
    const displayTimezone = getBrowserTimezone();
    
    // Use date string as key since we don't need timezone-specific grouping
    const key = dateString;
    
    if (!acc[key]) {
      acc[key] = {
        date: dateString,
        timezone: displayTimezone,
        data: []
      };
    }
    
    if (acc[key]) {
      acc[key].data.push(item);
    }
    return acc;
  }, {} as Record<string, GroupedByDateResult<T>>);

  // Convert to array and sort by date (newest first)
  return Object.values(grouped).sort((a, b) => {
    const dateA = moment(a.date, 'MMMM D, YYYY');
    const dateB = moment(b.date, 'MMMM D, YYYY');
    return dateB.valueOf() - dateA.valueOf();
  });
}

