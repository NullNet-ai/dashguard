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

const PickupEvent = ({
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

  return (
    <div
      key={event.id}
      className="relative mb-4 pl-6 last:mb-0"
      data-event-id={event.id}
      style={{
        // top: `${minutePosition}px`,
        // left: leftOffset,
        width: eventWidth,
      }}
    >
      <div
        className={cn(
          'absolute left-[-10px] h-full w-0.5 border-l-2',
          `${borderType}`,
          `${getEventLineColor(event?.metadata?.lineColor)}`,
          hourIndex === 0 ? 'top-0' : '-',
          // isLastHour && isLastDate ? "h-16" : "h-[70px]"
        )}
      />
      <div
        className={cn(
          'absolute left-[-26px] top-0 z-30 flex size-8 items-center justify-center rounded-full border-4 border-gray-300',
          `${getIconColor(event?.metadata?.iconColor)}`,
        )}
      >
        <Plane className="size-4 text-white" />
      </div>
      <div
        className={cn(
          'pb-2',
          totalEventsInHour > 1 ? 'mr-2' : 'lg:max-w-[50%]',
        )}
      >
        <h3 className="mb-1 text-md text-gray-900">{event.title}</h3>
        <p className="mb-2 text-sm text-gray-600">{event.subTitle}</p>

        {/* Time Display */}
      </div>

      {/* Additional Info for Pickup */}
      <div className="mb-1 rounded-lg bg-gray-100 p-4 py-2 lg:max-w-[50%]">
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex-1">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {event?.metadata?.vehicleInfo?.model}
              </div>
              <div className="text-xs text-gray-600">
                {event?.metadata?.vehicleInfo?.plate}
              </div>
            </div>

            <div className="mt-2 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  {event?.metadata?.passengerInfo?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-sm text-gray-900">
                    {event?.metadata?.passengerInfo?.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {event?.metadata?.passengerInfo?.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            {event?.metadata?.vehicleInfo?.imagePath ? (
              <Image
                alt="car image"
                width={50}
                height={50}
                className="size-16 h-auto w-[100px] text-gray-400 rounded-md"
                src={
                  'https://images.unsplash.com/photo-1587750059638-e7e8c43b99fc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dmludGFnZSUyMGNhcnxlbnwwfHwwfHx8MA%3D%3D'
                }
              />
            ) : (
              <ImageIcon className="size-16 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      {eventTime.format('mm') !== '00' && (
        <div
          className={cn(
            `mb-2 flex flex-col items-center gap-1 text-sm`,
            `${eventTime.format('mm') !== '00' ? 'absolute left-[-98px] top-[5px]' : ''}`,
          )}
        >
          <span className="font-medium text-gray-700">
            {eventTime.format('hh:mm A')}
          </span>
          {additionalTime && (
            <div>
              <span className="text-orange-600">
                {additionalTime.format('h:mm A')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


PickupEvent.displayName = 'PickupEvent';

export default PickupEvent;
