import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import DateRangeDisplay from './DateRangeDisplay';
import WeekDaysHeader from './WeekDaysHeader';
import { TimelineGroup } from '../../_common/types';
import moment from 'moment-timezone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { useCalendarContext } from '~/components/ui/calendar/views/CalendarProvider';

// Props that will be passed to the custom render function
interface CalendarHeaderRenderProps {
  uniqueDates: TimelineGroup[];
  weekOffset: number;
  hasEventsOnDate: (date: moment.Moment) => boolean;
  container: React.RefObject<HTMLDivElement>;
  newDates: TimelineGroup[];
  showWeekDate: boolean;
  headerTitle: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onGoToCurrentWeek?: () => void;
  onCreateEvent?: () => void;
  calendarType: 'timeline' | 'calendar';
  numberOfDays: number;
  scrollToCurrentTime: () => void;
  // Default components for reuse in custom renders
  components: {
    DateRangeDisplay: React.ComponentType<{
      uniqueDates: TimelineGroup[];
      numberOfDays?: number;
    }>;
    WeekDaysHeader: React.ComponentType<{
      weekOffset: number;
      hasEventsOnDate: (date: moment.Moment) => boolean;
      container: React.RefObject<HTMLDivElement>;
      newDates: TimelineGroup[];
      numberOfDays?: number;
    }>;
    Button: typeof Button;
    Select: typeof Select;
    SelectContent: typeof SelectContent;
    SelectItem: typeof SelectItem;
    SelectTrigger: typeof SelectTrigger;
    SelectValue: typeof SelectValue;
  };
  // Icons for reuse
  icons: {
    Calendar: typeof Calendar;
    ChevronLeft: typeof ChevronLeft;
    ChevronRight: typeof ChevronRight;
    Settings: typeof Settings;
  };
}

interface CalendarHeaderProps {
  uniqueDates: TimelineGroup[];
  weekOffset: number;
  hasEventsOnDate: (date: moment.Moment) => boolean;
  container: React.RefObject<HTMLDivElement>;
  newDates: TimelineGroup[];
  showWeekDate?: boolean;
  headerTitle: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onGoToCurrentWeek?: () => void;
  onCreateEvent?: () => void;
  calendarType: 'timeline' | 'calendar';
  numberOfDays?: number; // Optional prop for dynamic days display
  navigateToDateAndScroll?: (targetDateTime: string, scrollToTime?: boolean) => void;
  // Custom render prop - if provided, it will override the default rendering
  // Can be either a function or a React component
  customRender?:
    | ((props: CalendarHeaderRenderProps) => React.ReactNode)
    | React.ComponentType<CalendarHeaderRenderProps>;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  uniqueDates,
  weekOffset,
  hasEventsOnDate,
  container,
  newDates,
  showWeekDate = true,
  headerTitle = 'Calendar',
  onPrevWeek,
  onNextWeek,
  onGoToCurrentWeek,
  onCreateEvent,
  calendarType,
  numberOfDays = 7, // Default to 7 days if not provided
  navigateToDateAndScroll,
  customRender,
}) => {

  const { config, navigateToDateAndScroll: contextNavigateToDateAndScroll } = useCalendarContext();

  const  timezone = config?.timezone || 'Asia/Manila';
  
  const scrollToCurrentTime = () => {

    const currentDateTime = moment().tz(timezone).toISOString();
    
    // Use the passed prop or fallback to context
    const navFunction = navigateToDateAndScroll || contextNavigateToDateAndScroll;
    navFunction(currentDateTime, true);
  };

  // If custom render is provided, use it with all necessary props
  if (customRender) {
    const renderProps: CalendarHeaderRenderProps = {
      uniqueDates,
      weekOffset,
      hasEventsOnDate,
      container,
      newDates,
      showWeekDate,
      headerTitle,
      onPrevWeek,
      onNextWeek,
      onGoToCurrentWeek,
      onCreateEvent,
      calendarType,
      numberOfDays,
      scrollToCurrentTime,
      components: {
        DateRangeDisplay,
        WeekDaysHeader,
        Button,
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
      },
      icons: {
        Calendar,
        ChevronLeft,
        ChevronRight,
        Settings,
      },
    };

    let component: any = null;

    // Check if customRender is a function or a React component
    if (typeof customRender === 'function') {
      // Try to determine if it's a React component or a render function
      // React components typically have a displayName, name, or prototype.render
      const isReactComponent =
        customRender.prototype?.render ||
        (customRender as React.ComponentType<CalendarHeaderRenderProps>)
          .displayName ||
        (customRender.name &&
          customRender.name[0] &&
          customRender.name.startsWith(customRender.name[0].toUpperCase()));

      if (isReactComponent) {
        // Treat as React component
        const CustomComponent =
          customRender as React.ComponentType<CalendarHeaderRenderProps>;
        component = <CustomComponent {...renderProps} />;
      } else {
        // Treat as render function
        const renderFunction = customRender as (
          props: CalendarHeaderRenderProps,
        ) => React.ReactNode;
        component = <>{renderFunction(renderProps)}</>;
      }
    }

    // Fallback: treat as render function
    component = (
      <>
        {(
          customRender as (props: CalendarHeaderRenderProps) => React.ReactNode
        )(renderProps)}
      </>
    );

    return (
      <div className="mb-2 bg-white">
        {component}
        {showWeekDate ? (
       <div className="">
            <WeekDaysHeader
              weekOffset={weekOffset}
              hasEventsOnDate={hasEventsOnDate}
              container={container}
              newDates={newDates}
              numberOfDays={numberOfDays}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // Default rendering (backward compatibility)
  return (
    <div className="mb-2 bg-white">
      <div className="px-2">
        {calendarType === 'calendar' && (
          <div className="flex items-center justify-between">
            {/* Left section with Today button and navigation */}

            <div className="flex items-center gap-4">
              {/* <Button
                onClick={scrollToCurrentTime}
                className="h-9 gap-1 px-4"
                size={'sm'}
                variant={'outline'}
              >
                <span>Today</span>
              </Button> */}

              <div className="flex items-center">
                <button
                  onClick={onPrevWeek}
                  className="rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={onNextWeek}
                  className="rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <h1 className="text-md font-normal text-gray-900">
                <DateRangeDisplay
                  uniqueDates={uniqueDates}
                  numberOfDays={numberOfDays}
                />
              </h1>
            </div>

            {/* Right section with controls */}
            {/* <div className="flex items-center gap-3">
              <button className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <Settings className="h-5 w-5" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <Select defaultValue="Week">
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day">Day</SelectItem>
                    <SelectItem value="Week">Week</SelectItem>
                    <SelectItem value="Month">Month</SelectItem>
                    <SelectItem value="Year">Year</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="h-9 gap-1"
                  size={'sm'}
                  onClick={onCreateEvent}
                >
                  <Calendar className="size-4" />
                  <span>Create</span>
                </Button>
              </div>
            </div> */}
          </div>
        )}
      </div>

      {showWeekDate ? (
   <div className="">
          <WeekDaysHeader
            weekOffset={weekOffset}
            hasEventsOnDate={hasEventsOnDate}
            container={container}
            newDates={newDates}
            numberOfDays={numberOfDays}
          />
        </div>
      ) : null}
    </div>
  );
};

export default CalendarHeader;
export type { CalendarHeaderRenderProps };
