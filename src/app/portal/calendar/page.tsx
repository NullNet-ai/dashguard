'use client';

import StateTab from '~/components/platform/StateTab';
import NewComingSoon from '~/components/ui/coming-soon';
import CalendarControl from '~/components/ui/calendar/index';

import {
  ArrivalEvent,
  DefaultEvent,
  DepartureEvent,
  PickupEvent,
  TestEvent,
} from './_components/custom_ui_events';
import { dummyData } from './_components/dummydata';
import { useState } from 'react';
import { EventType } from '~/components/ui/calendar/_components/views/_common/types';
import CustomHeader from './_components/custom-header';
import CustomSidebar from './_components/custom-sidebar';

const Page = () => {

  const [eventData, setEventData] = useState<EventType[]>(dummyData);
  const [defaultDate, setDefaultDate] = useState('2025-10-04');

  const handleSubmit = (e: any) => {
    setEventData(
      [...eventData, e]
    );
  }


  const tabs = [
    {
      id: 'calendar',
      label: 'Calendar',
      content: (
        <CalendarControl
          events={eventData}
          viewType="calendar"
          eventComponents={[
            DefaultEvent,
            ArrivalEvent,
            DepartureEvent,
            PickupEvent,
            TestEvent,
          ]}
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          // customHeaderRender={CustomHeader}
          config={{
            variant: 'custom',
            eventFormType: 'modal',
            headerNumberOfDays: 14,
            timezone: 'Asia/Manila',
            // defaultDate: defaultDate,
          }}
        />
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: (
        <CalendarControl
          events={eventData}
          viewType="timeline"
          eventComponents={[
            DefaultEvent,
            ArrivalEvent,
            DepartureEvent,
            PickupEvent,
            TestEvent,
          ]}
           onSubmit={(e) => {
            handleSubmit(e);
          }}
          customHeaderRender={CustomHeader}
          customSideBar={CustomSidebar}
          config={{
            variant: 'custom',
            eventFormType: 'modal',
            headerNumberOfDays: 14
          }}
        />
      ),
    },
    {
      id: 'Map',
      label: 'Map',
      content: <NewComingSoon type="inner-component" />,
    },
    {
      id: 'Advisor',
      label: 'Advisor',
      content: <NewComingSoon type="inner-component" />,
    },
  ];

  return (
    <div className="">
      <StateTab
        defaultValue="calendar"
        persistKey="side-drawer-tabs"
        tabs={tabs}
        variant="underline"
        size="md"
      />
    </div>
  );
};

export default Page;
