'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ulid } from 'ulid';
import moment from 'moment-timezone';
import { useCalendarData } from '../_components/views/hooks/useCalendarData';
import { useCalendarNavigation } from '../_components/views/hooks/useCalendarNavigation';
import { useScrollToCurrentTime } from '../_components/views/hooks/useScrollToCurrentTime';
import { type ICalendarProps } from '../_components/views/_common/types';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import EventForm from '../_components/views/components/EventForm';
import { calculateWeekOffsetForDate } from '../_components/views/utils/dateCalculations';
import { calculateScrollPosition } from '../_components/views/utils/scrollCalculations';

interface CalendarContextType {
  // State
  open: boolean;
  setOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  defaultValues: any;
  setDefaultValues: (values: any) => void;
  container: React.RefObject<HTMLDivElement>;

  // Navigation
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  goToCurrentWeek: () => void;
  onNextWeek: () => void;
  navigateToDateAndScroll: (targetDateTime: string, scrollToTime?: boolean) => void;


  // Calendar data
  uniqueDates: any[];
  newDates: any[];
  hasEventsOnDate: (date: any) => boolean;

  // Event handlers
  handleNavigationClick: (date: any) => void;
  handleMiniCalendarSelect: (date?: Date) => void;
  handleCreateEvent: () => void;
  handleDayClick: (day: any) => void;
  handleEventCreate: (event: any) => void;
  handleEventClick: (event: any) => void;
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;

  // Props
  events: any[];
  eventComponents?: any;
  onDayClick?: (day: any) => void;
  onClickEvent?: (event: any) => void;
  onSubmit?: (event: any) => void;
  config?: ICalendarProps['config'];
  customHeaderRender?: ((props: any) => React.ReactNode) | React.ComponentType<any>;
  customSideBar?: ((props: any) => React.ReactNode) | React.ComponentType<any>;
  timezone: string;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      'useCalendarContext must be used within a CalendarProvider',
    );
  }
  return context;
};

interface CalendarProviderProps extends Omit<ICalendarProps, 'children'> {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({
  events = [],
  eventComponents,
  onDayClick,
  onSubmit,
  children,
  config,
  customHeaderRender,
  customSideBar,
  ...rest
}) => {
  // State management
  const container = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [defaultValues, setDefaultValues] = useState<any>({
    start: '2025-06-09 13:43:00',
  });
  const { actions: sideDrawerActions } = useSideDrawer();

    // Handle side drawer configuration
  const drawer_config = {
    header: 'Create Event',
    sideDrawerWidth: '30dvw',
    body: {
      component: EventForm,
      componentProps: {
         onSubmit:(data: any) => {
            const eventData = {
              title: data.title,
              subTitle: data.subTitle,
              start: moment.tz(data.start, data.timezone).toISOString(),
              end: data.end ? moment.tz(data.end, data.timezone).toISOString() : undefined,
              color: data.color,
              timezone: data.timezone,
              showTime: data.showTime,
              showInTimeline: data.showInTimeline,
              showInCalender: data.showInCalender,
              metadata: {
                duration: data.duration || undefined,
                iconColor: data.iconColor,
                lineColor: data.lineColor,
                lineType: data.lineType,
                status: data.status || undefined,
                component: data.component || undefined,
                delayed: data.delayed,
                delayText: data.delayText || undefined,
                additionalTime: data.additionalTime || undefined,
                passengerInfo: data.passengerName || data.passengerPhone ? {
                  name: data.passengerName || '',
                  phone: data.passengerPhone || '',
                } : undefined,
                vehicleInfo: data.vehicleModel || data.vehiclePlate || data.vehicleImagePath ? {
                  model: data.vehicleModel || '',
                  plate: data.vehiclePlate || '',
                  imagePath: data.vehicleImagePath || undefined,
                } : undefined,
              },
            };
            onSubmit?.({ ...eventData, id: ulid() });
            // sideDrawerActions?.closeSideDrawer();
          },
          eventFormType:config?.eventFormType,
          defaultValues:defaultValues,
          eventComponents:eventComponents,
          formId:'event-form-drawer',
          showFooter:true,
          // onCancel:() => sideDrawerActions?.closeSideDrawer(),
          submitButtonText:"Create Event",
          cancelButtonText:"Cancel"
      },
    },
    onCloseSideDrawer() {
      //
    },
  };

  // Navigation hooks
  const {
    weekOffset,
    setWeekOffset,
    handlePrevWeek,
    handleNextWeek,
    goToCurrentWeek,
  } = useCalendarNavigation({
    defaultDate: config?.defaultDate,
    timezone: config?.timezone || 'Asia/Manila',
    numberOfDays: config?.headerNumberOfDays || 7
  });

  // Calendar data
  const { uniqueDates, newDates, hasEventsOnDate } = useCalendarData(
    weekOffset,
    events,
    'calendar',
    config?.headerNumberOfDays || 7,
    config?.timezone || 'Asia/Manila',
    config?.defaultDate,
  );  

  // Scroll to current time
  useScrollToCurrentTime(container, weekOffset, uniqueDates, config?.timezone || 'Asia/Manila', config?.defaultDate);

  // Event handlers
  const handleNavigationClick = (date: any) => {
    // log here
  };

  const onNextWeek = () => handleNextWeek();

  // Centralized navigation function that can navigate to any date and optionally scroll to a specific time
  const navigateToDateAndScroll = (targetDateTime: string, scrollToTime = true) => {

    
    const timezone = config?.timezone || 'Asia/Manila';
    const targetMoment = moment(targetDateTime).tz(timezone);
    const targetDateString = targetMoment.format('YYYY-MM-DD');
    
    // Check if target date is in the visible range
    const targetDateIndex = newDates.findIndex(
      (group) => group.date === targetDateString,
    );
    
    
    // If target date is not in the visible range, navigate to target week first
    if (targetDateIndex === -1) {
      
      const numberOfDays = config?.headerNumberOfDays || 7;
      const weekOffset = calculateWeekOffsetForDate(targetDateTime, timezone, numberOfDays);
      
      setWeekOffset(weekOffset);
      
      if (scrollToTime) {
        // Wait for the navigation to complete, then scroll to the specific time
        setTimeout(() => {

          scrollToTargetTime(targetDateTime, timezone);
        }, 300);
      }
      return;
    }
    
    
    // If target date is visible and scrolling is requested, scroll directly to the time
    if (scrollToTime) {
      scrollToTargetTime(targetDateTime, timezone);
    }
  };
  
  const scrollToTargetTime = (targetDateTime: string, timezone: string) => {
    if (!container?.current) return;
    
    const targetMoment = moment(targetDateTime).tz(timezone);
    const targetDateString = targetMoment.format('YYYY-MM-DD');
    
    // Polling mechanism to wait for target date to be available
    const waitForTargetDate = (retries = 10) => {
      const targetDateIndex = newDates.findIndex(group => group.date === targetDateString);
      
      if (targetDateIndex !== -1) {
        // Target date found, proceed with scrolling
        const targetHour = targetMoment.hour();
        const targetMinute = targetMoment.minute();
        
        // Use the dedicated scroll calculation utility
        const scrollPosition = calculateScrollPosition(
          targetDateIndex,
          targetHour,
          targetMinute,
          newDates
        );
        
        // Smooth scroll to the target position
        container?.current?.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });

      } else if (retries > 0) {
        // Target date not found, retry after a short delay
        setTimeout(() => {
          waitForTargetDate(retries - 1);
        }, 100);
      } else {
        console.warn('Target date not found after retries:', targetDateString);
      }
    };
    
    waitForTargetDate();
  };

  const handleMiniCalendarSelect = (date?: Date) => {
    setSelectedDate(date);
    if (date) {
      const today = moment().tz(config?.timezone || 'Asia/Manila');
      const selected = moment(date);
      const numberOfDays = config?.headerNumberOfDays || 7;
      // Calculate the start of the period for both today and selected date (Friday-based)
      const getFridayStart = (d: moment.Moment) => {
        const dayOfWeek = d.day();
        let daysToFriday;
        if (dayOfWeek === 5) {
          daysToFriday = 0;
        } else if (dayOfWeek === 6) {
          daysToFriday = 1;
        } else {
          daysToFriday = dayOfWeek + 2;
        }
        return d.clone().subtract(daysToFriday, 'days');
      };
      const startOfCurrentPeriod = getFridayStart(today);
      const startOfSelectedPeriod = getFridayStart(selected);
      const daysDiff = startOfSelectedPeriod.diff(startOfCurrentPeriod, 'days');
      const periodsDiff = Math.floor(daysDiff / numberOfDays);
      setWeekOffset(periodsDiff);
    }
  };

  const handleCreateEvent = () => {
    
    if(config?.eventFormType ==='modal') {
      setOpen(true)
    }
    else {
      sideDrawerActions?.openSideDrawer(drawer_config);
    }
  };

  const handleEventClick = (event: any) => {
    // Handle event click logic here
    setIsSidebarCollapsed(false);
    setSelectedEvent(event);
    
  }

  const handleDayClick = (day: any) => {
    setDefaultValues({
      start: day.fullDateTime,
      timezone: day.timezone,
    });
    if(config?.eventFormType ==='modal') {
      setOpen(true)
    }
    else {
      sideDrawerActions?.openSideDrawer(drawer_config);
    }
    onDayClick?.(day);
  };

  const handleEventCreate = (event: any) => {
    onSubmit?.({ ...event, id: ulid() });
  };

  const contextValue: CalendarContextType = {
    // State
    open,
    setOpen,
    sidebarOpen,
    setSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedDate,
    setSelectedDate,
    defaultValues,
    setDefaultValues,
    container,
    config,
    // Navigation
    weekOffset,
    setWeekOffset,
    handlePrevWeek,
    handleNextWeek,
    goToCurrentWeek,
    onNextWeek,
    navigateToDateAndScroll,

    // Calendar data
    uniqueDates,
    newDates,
    hasEventsOnDate,

    // Event handlers
    handleNavigationClick,
    handleMiniCalendarSelect,
    handleCreateEvent,
    handleDayClick,
    handleEventClick,
    handleEventCreate,
    selectedEvent,
    setSelectedEvent,

    // Props
    events,
    eventComponents,
    onDayClick,
    onSubmit,
    customHeaderRender,
    customSideBar,
    timezone: config?.timezone || 'Asia/Manila',
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};
