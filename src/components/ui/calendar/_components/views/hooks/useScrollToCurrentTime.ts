import { useEffect } from 'react';
import moment from 'moment';
import { TimelineGroup } from '../_common/types';

export const useScrollToCurrentTime = (
  container: any,
  weekOffset: number,
  uniqueDates: TimelineGroup[],
  timezone = 'Asia/Manila',
  defaultDate?: string
) => {
  useEffect(() => {
    const scrollToCurrentTime = () => {
      if (container.current) {
        const now = moment().tz(timezone);
        const currentDate = defaultDate ? defaultDate : now.format('YYYY-MM-DD');

        // Check if current date is in the visible week
        const isCurrentDateVisible = uniqueDates.some(
          (group) => group.date === currentDate,
        );

        if (!isCurrentDateVisible) {
          return; // Don't scroll if current date is not in view
        }

        // Find the current date group index, considering timezone
        let currentDateGroupIndex = -1;
        
        // First, try to find exact match with both date and timezone
        const exactMatch = uniqueDates.findIndex(group => 
          group.date === currentDate && group.timezone === timezone
        );
        
        if (exactMatch !== -1) {
          currentDateGroupIndex = exactMatch;
        } else {
          // Fallback: find any group with the current date
          currentDateGroupIndex = uniqueDates.findIndex(group => group.date === currentDate);
        }

        if (currentDateGroupIndex === -1) return;

        const currentHour = now.hour();
        const currentMinute = now.minute();

        // Calculate scroll position using the same logic as WeekDaysHeader
        const dateHeaderHeight = 60;
        const hourHeight = 80;

        let scrollPosition = 0;

        // Add height for previous date groups
        for (let i = 0; i < currentDateGroupIndex; i++) {
          scrollPosition += dateHeaderHeight;
          scrollPosition += (uniqueDates[i]?.timeline?.length || 0) * hourHeight;
        }

        // Add current date header
        scrollPosition += dateHeaderHeight;

        // Add hours before current hour
        scrollPosition += currentHour * hourHeight;

        // Add minutes within current hour
        scrollPosition += (currentMinute / 60) * hourHeight;
        // Scroll to position with some offset to center it better
        container.current.scrollTo({
          top: scrollPosition - 100,
          behavior: 'smooth'
        })
      }
    };

    const timeoutId = setTimeout(scrollToCurrentTime, 300);
    return () => clearTimeout(timeoutId);
  }, [weekOffset, uniqueDates, container, timezone, defaultDate]);
};