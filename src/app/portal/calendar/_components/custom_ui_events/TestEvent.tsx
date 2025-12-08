'use client'

import { cn } from '~/lib/utils';

import moment from 'moment-timezone';
import { Car, Plane, ImageIcon, PlaneLanding } from 'lucide-react';
import Image from 'next/image';
import { GroupedEvent } from '~/components/ui/calendar/_components/views/_common/types';
import { getEventLineColor, getIconColor } from '~/components/ui/calendar/_components/views/_common/utils';


interface Props {
  event: GroupedEvent;
  hourIndex: number;
  eventIndex?: number;
  totalEventsInHour?: number;
  calenderType?: 'timeline' | 'calendar';
  previousGroup?: GroupedEvent | null;
}

const TestEvent = ({
  event,
  hourIndex,
  eventIndex = 0,
  totalEventsInHour = 1,
  calenderType,
}: Props) => {
  const eventTime = moment(event.start);
  const additionalTime = event.metadata?.additionalTime
    ? moment(event.metadata.additionalTime)
    : null;

  const borderType =
    event?.metadata?.lineType === 'solid' ? 'border-solid' : 'border-dashed';

  // Calculate the exact position based on minutes
  // Assuming each hour slot is 80px tall (min-h-[80px])
  const hourBlockHeight = 80;
  const minutePosition = (event.exactMinutes / 60) * hourBlockHeight;

  // Calculate horizontal positioning for multiple events
  const eventWidth =
    totalEventsInHour > 1 ? `${100 / totalEventsInHour}%` : '100%';
  const leftOffset =
    totalEventsInHour > 1 ? `${(eventIndex * 100) / totalEventsInHour}%` : '0%';

  return <div data-event-id={event.id}>Test Event here</div>

};

TestEvent.displayName = 'TestEvent';

export default TestEvent;
