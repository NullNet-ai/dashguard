'use client';

import React, { useState } from 'react';
import moment from 'moment-timezone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Calendar } from 'lucide-react';
import { type EventType } from '../_common/types';
import { useCalendarContext } from '../../../views/CalendarProvider';
import { useSideDrawer } from '~/components/platform/SideDrawer';
import EventForm, { type EventFormData } from './EventForm';

interface CreateEventProps {
  trigger?: React.ReactNode;
  onEventCreate?: (event: Omit<EventType, 'id'>) => void;
  defaultValues?: Partial<EventType>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  eventComponents?: React.ComponentType<any>[];
}



const CreateEvent: React.FC<CreateEventProps> = ({
  trigger,
  onEventCreate,
  defaultValues,
  open,
  onOpenChange,
  eventComponents = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    config
  } = useCalendarContext();
  

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const onSubmit = (data: EventFormData) => {
    const eventData: Omit<EventType, 'id'> = {
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

    onEventCreate?.(eventData);
    handleOpenChange(false);
  };

  const dialogOpen = open !== undefined ? open : isOpen;

  if (config?.eventFormType === 'side-drawer') {
    return null;
  }
  

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new calendar event.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <EventForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            eventComponents={eventComponents}
            formId="event-form"
            eventFormType={config?.eventFormType}
          />
        </div>
        
        <DialogFooter className="flex-shrink-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="event-form">
            Create Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEvent;