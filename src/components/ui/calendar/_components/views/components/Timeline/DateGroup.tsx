import React from 'react';
import DateHeader from './DateHeader';
import HourSlot from './HourSlot';
import { ICalendarProps, TEventComponent, TimelineGroup } from '../../_common/types';
interface DateGroupProps 
extends Omit<ICalendarProps, 'events' | 'viewType'> 
{
  group: TimelineGroup;
  calendarType?: 'timeline' | 'calendar';
  previousGroup?: TimelineGroup | null;
  groupIndex?: number;
  eventComponents?: TEventComponent[]
  onClickEvent?: (event: any) => void;
}

const DateGroup: React.FC<DateGroupProps> = ({
  group,
  calendarType = 'calendar',
  previousGroup,
  groupIndex,
  eventComponents,
  onClickEvent,
  ...rest
}) => {
  
  // Use the already filtered timeline from TimelineContainer
  const filteredTimeline = group?.timeline || [];

  const hoursWithEvents =
    calendarType === 'calendar'
      ? filteredTimeline?.map((timeSlot) => ({
          timeSlot,
          events: group.events.filter(
            (event) => event.hourPosition === timeSlot.hour,
          ),
        }))
      : filteredTimeline
          .map((timeSlot) => {
            const eventsForHour = group.events.filter(
              (event) => event.hourPosition === timeSlot.hour,
            );
            return {
              timeSlot,
              events: eventsForHour,
            };
          })
          .filter((hourData) => hourData.events.length > 0);

  const prevHoursWithEvents =
    previousGroup &&
    previousGroup.timeline
      .map((timeSlot) => {
        const eventsForHour = previousGroup.events.filter(
          (event) => event.hourPosition === timeSlot.hour,
        );
        return {
          timeSlot,
          events: eventsForHour,
        };
      })
      .filter((hourData) => hourData.events.length > 0);

  return (
    <div className="relative">
      <DateHeader
        group={group}
        calendarType={calendarType}
        previousGroup={previousGroup}
        groupIndex={groupIndex}
      />
      {hoursWithEvents.map((timeSlot, hourIndex) => {

        // Get the previous time slot based on hourIndex
        const previousTimeSlot = hourIndex === 0 ? null : hoursWithEvents[hourIndex - 1];
        
        return (
          <>
            <HourSlot
              key={timeSlot.timeSlot?.timestamp}
              previousTimeSlot={previousTimeSlot}
              timeSlot={timeSlot?.timeSlot}
              group={group}
              hourIndex={hourIndex}
              calendarType={calendarType}
              previousGroup={previousGroup}
              eventComponents={eventComponents}
              onEventClick={onClickEvent}
              {...rest}
            />
          </>
        );
      })}
    </div>
  );
};

export default DateGroup;
