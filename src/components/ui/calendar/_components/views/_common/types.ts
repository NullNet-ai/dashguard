import { type MouseEventHandler } from 'react';

export interface GroupedEvent extends EventType {
    displayTime: string;
    displayDate: string;
    hourPosition: number;
    exactMinutes: number;
    pairEventData?: GroupedEvent[];
  }
  
  export interface TimelineGroup {
    date: string;
    timezone: string;
    timezoneAbbrev: string;
    displayDate: string;
    timeline: Array<{ hour: number; displayTime: string; timestamp: string }>;
    events: GroupedEvent[];
    earliestEventTime: number; // Add this line
  }

  interface TimelineItem {
    hour: number;
    displayTime: string;
    timestamp: string;
  }

  export interface DayData {
    date: string;
    timezone: string;
    timezoneAbbrev: string;
    displayDate: string;
    timeline: TimelineItem[];
    events: EventType[];
    earliestEventTime?: number;
  }

  export interface EventType {
    id: string;
    title: string;
    pairId?: string
    subTitle: string;
    start: string; // ISO string with timezone info
    end?: string; // Optional end time
    color: string;
    timezone: string; // IANA timezone identifier (e.g., 'Asia/Taipei', 'America/Los_Angeles')
    showTime: boolean;
    showInTimeline?: boolean;
    showInCalender?: boolean;
    metadata?: {
      duration?: string;
      iconColor?: 'warning' | 'secondary' | 'primary';
      lineColor?: 'warning' | 'secondary' | 'primary';
      lineType?: 'solid' | 'dashed';
      status?: string;
      component?: string;
      delayed?: boolean;
      delayText?: string;
      additionalTime?: string;
      passengerInfo?: {
        name: string;
        phone: string;
      };
      vehicleInfo?: {
        model: string;
        plate: string;
        imagePath?: string
      };
    };
  }

 export type TCalenderType = 'timeline' | 'calendar'

 export type TEventComponent = React.ComponentType<{
  event: GroupedEvent;
  hourIndex: number;
  eventIndex?: number;
  totalEventsInHour?: number;
  calenderType?: TCalenderType
  previousGroup?: GroupedEvent | null;
  onEventClick?: MouseEventHandler<HTMLDivElement> | undefined;
  timezone?: string;
  allEventsInTimeline?: GroupedEvent[];
}>

 export  interface ICalendarProps {
    events: EventType[];
    viewType: 'calendar' | 'timeline';
    onEventClick?: (event: EventType) => void;
    onDayClick?: (event: TEventDay) => void;
    onWeekChange?: (days: any) => void;
    onSubmit?: (event: EventType) => void;
    loading?: boolean;
    eventComponents?: TEventComponent[] 
    customHeaderRender?: ((props: any) => React.ReactNode) | React.ComponentType<any>;
    customSideBar?: ((props: any) => React.ReactNode) | React.ComponentType<any>;
    config: {
        variant?: 'regular' | 'custom',   
        showMiniCalendar?: boolean;
        eventFormType?: 'side-drawer' | 'modal'
        headerNumberOfDays?: number;
        timezone?: string;
        defaultDate?: string; // ISO date string (e.g., '2025-09-11') to jump to specific date
        isInfinite?: boolean;
        timelineHeight?: string;
    }
  }

export type TEventDay = {
  date: string;
  time: string;
  fullDateTime: string;
  timezone: string;
  clickPosition: {
    y: number;
    minutes: number;
    hourHeight: number;
  };
  event?: EventType; // Optional event data when user clicks on an event
}