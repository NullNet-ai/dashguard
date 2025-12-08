'use client';

import React from 'react';
import { Loader } from '../loader';
import {
  type ICalendarProps,
} from './_components/views/_common/types';
import CalendarViewControl from './views/calendar-view';
import TimelineViewControl from './views/timeline-view';

const CalendarControl = React.memo(({
  events,
  viewType,
  loading,
  eventComponents,
  ...rest
}: ICalendarProps) => {
  if (loading) {
    return (
      <div className="p-4">
        <Loader
          className="bg-primary text-primary"
          label="Loading data..."
          size="lg"
          variant="spinner"
        />
      </div>
    );
  }

  if (viewType === 'calendar') {
    return (
      <CalendarViewControl
        events={events}
        viewType="calendar"
        eventComponents={eventComponents}
        {...rest}
      />
    );
  }
  return (
    <TimelineViewControl
      events={events}
      viewType="timeline"
      eventComponents={eventComponents}
      {...rest}
    />
  );
}, (prevProps, nextProps) => {  
  // Check if viewType has changed
  if (prevProps.viewType !== nextProps.viewType) {
    return false;
  }

  // Check if events array has changed
  if (prevProps.events !== nextProps.events) {
    return false;
  }
  
  // Check if config object has changed
  if (prevProps.config.defaultDate !== nextProps.config.defaultDate) {
    return false;
  }
  
  // Props are equal, no re-render needed
  return true;
});

CalendarControl.displayName = 'CalendarControl';

export default CalendarControl;
