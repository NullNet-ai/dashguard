'use client';

import React from 'react';
import CalendarHeader from '../_components/views/components/CalendarHeader/CalendarHeader';
import TimelineContainer from '../_components/views/components/Timeline/TimelineContainer';
import { Calendar } from '~/components/ui/calendar';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  X,
} from 'lucide-react';
import { type ICalendarProps } from '../_components/views/_common/types';
import CreateEvent from '../_components/views/components/CreateEvent';
import moment from 'moment-timezone';
import { CalendarProvider, useCalendarContext } from './CalendarProvider';
import { SideDrawerProvider } from '~/components/platform/SideDrawer';
import { cn } from '~/lib/utils';

// Internal component that uses the context
const CalendarViewInternal = () => {
  const {
    open,
    setOpen,
    selectedDate,
    defaultValues,
    container,
    weekOffset,
    uniqueDates,
    newDates,
    hasEventsOnDate,
    handlePrevWeek,
    onNextWeek,
    goToCurrentWeek,
    handleNavigationClick,
    handleMiniCalendarSelect,
    handleCreateEvent,
    handleDayClick,
    handleEventCreate,
    eventComponents,
    customSideBar,
    config,
    customHeaderRender,
    handleEventClick,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    navigateToDateAndScroll,
  } = useCalendarContext();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Memoized custom sidebar renderer to prevent unnecessary re-calculations
  const renderCustomSidebar = React.useMemo(() => {
    if (!customSideBar) return null;

    const renderProps = {
      selectedDate,
      weekOffset,
      uniqueDates,
      newDates,
      hasEventsOnDate,
      handleMiniCalendarSelect,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
    };

    // Check if customSideBar is a function or a React component
    if (typeof customSideBar === 'function') {
      // Try to determine if it's a React component or a render function
      // React components typically have a displayName, name, or prototype.render
      const isReactComponent =
        customSideBar.prototype?.render ||
        (customSideBar as React.ComponentType<any>).displayName ||
        (customSideBar.name &&
          customSideBar.name[0] &&
          customSideBar.name.startsWith(customSideBar.name[0].toUpperCase()));

      if (isReactComponent) {
        // Treat as React component
        const CustomComponent = customSideBar as React.ComponentType<any>;
        return <CustomComponent {...renderProps} />;
      } else {
        // Treat as render function
        const renderFunction = customSideBar as (props: any) => React.ReactNode;
        return <>{renderFunction(renderProps)}</>;
      }
    }

    // Fallback: treat as render function
    return (
      <>{(customSideBar as (props: any) => React.ReactNode)(renderProps)}</>
    );
  }, [
    customSideBar,
    selectedDate,
    weekOffset,
    uniqueDates,
    newDates,
    hasEventsOnDate,
    handleMiniCalendarSelect,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ]);

  return (
    <div className="flex h-full flex-col px-2">

      {!customHeaderRender && (
        <div className="mb-4 rounded-sm bg-slate-100 p-2">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="text-md font-bold text-foreground">Timeline</h2>
          </div>
        </div>
      )}

      <div className="flex flex-row">
        <div className="flex-1">
          <CalendarHeader
            calendarType="timeline"
            uniqueDates={uniqueDates}
            showWeekDate={false}
            headerTitle="Calendar"
            weekOffset={weekOffset}
            hasEventsOnDate={hasEventsOnDate}
            container={container as React.RefObject<HTMLDivElement>}
            newDates={newDates}
            onPrevWeek={handlePrevWeek}
            onNextWeek={onNextWeek}
            onGoToCurrentWeek={goToCurrentWeek}
            onCreateEvent={handleCreateEvent}
            navigateToDateAndScroll={navigateToDateAndScroll}
            // numberOfDays={config?.headerNumberOfDays}
            customRender={customHeaderRender}
          />

          <TimelineContainer
            container={container as React.RefObject<HTMLDivElement>}
            newDates={newDates}
            calendarType="timeline"
            eventComponents={eventComponents}
            onDayClick={handleDayClick}
            config={{}}
            onClickEvent={handleEventClick}
          />
        </div>

        <div className="relative h-[calc(100dvh-102px)] overflow-y-auto">
          {customSideBar ? (
            <div
              className={cn(
                ` transition-all duration-300 ease-in-out `,
                `${isSidebarCollapsed ? 'w-0 overflow-hidden' : ''}`,
                `${isSidebarCollapsed ? 'p-0 opacity-0' : 'opacity-100 p-4'}`,
              )}
            >
              <div className="absolute right-0 top-0 z-10">
                <button
                  onClick={() => {
                    setIsSidebarCollapsed(true);
                  }}
                  className="rounded-full bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {renderCustomSidebar}
            </div>
          ) : (
            <>
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="absolute left-[-23px] top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={
                  isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
              >
                {!isSidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>

              {/* Sidebar */}
              <div
                className={`h-full border-l border-border bg-background/50 transition-all duration-300 ease-in-out ${
                  isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
                }`}
              >
                <div
                  className={`p-4 pt-3 transition-opacity duration-300 ${
                    isSidebarCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-foreground">
                      {moment(selectedDate).format('MMMM YYYY')}
                    </div>

                    {/* Small Calendar */}
                    <div className="rounded-md border p-2 pt-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleMiniCalendarSelect}
                        onNextClick={handleNavigationClick}
                        onPrevClick={handleNavigationClick}
                        className="w-full p-0"
                        classNames={{
                          months:
                            'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 items-center justify-center',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component that wraps with provider
const CalendarViewControl = (props: ICalendarProps) => {
  return (
    <CalendarProvider {...props}>
      <SideDrawerProvider>
        <CalendarViewInternal />
      </SideDrawerProvider>
    </CalendarProvider>
  );
};

export default CalendarViewControl;
