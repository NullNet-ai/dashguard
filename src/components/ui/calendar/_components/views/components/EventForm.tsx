'use client';

import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import moment from 'moment-timezone';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { CalendarCheck, Clock, User, Car } from 'lucide-react';
import { EventType } from '../_common/types';
import { useCalendarContext } from '../../../views/CalendarProvider';
import { cn } from '~/lib/utils';

interface EventFormData {
  title: string;
  subTitle: string;
  start: string;
  end?: string;
  color: string;
  timezone: string;
  showTime: boolean;
  showInTimeline?: boolean;
  showInCalender?: boolean;
  duration?: string;
  iconColor?: 'warning' | 'secondary' | 'primary';
  lineColor?: 'warning' | 'secondary' | 'primary';
  lineType?: 'solid' | 'dashed';
  status?: string;
  component?: string;
  delayed?: boolean;
  delayText?: string;
  additionalTime?: string;
  passengerName?: string;
  passengerPhone?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleImagePath?: string;
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  defaultValues?: Partial<EventType>;
  eventComponents?: React.ComponentType<any>[];
  formId?: string;
  showFooter?: boolean;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  eventFormType?: 'modal' | 'drawer';
}

// Import timezone options from utils
const timezones = [
  // UTC and GMT
  'UTC',
  'GMT',

  // Asia
  'Asia/Manila',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Riyadh',

  // Europe
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Vienna',
  'Europe/Zurich',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Moscow',

  // North America
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Montreal',

  // Central/South America
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Sao_Paulo',
  'America/Caracas',

  // Australia/Oceania
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Pacific/Auckland',
  'Pacific/Fiji',

  // Africa
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Casablanca',
];

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#EF4444', label: 'Red' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6B7280', label: 'Gray' },
];

const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  defaultValues,
  eventComponents = [],
  formId = 'event-form',
  showFooter = false,
  onCancel,
  submitButtonText = 'Create Event',
  cancelButtonText = 'Cancel',
  eventFormType= 'modal'
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { config } = useCalendarContext();
    const  timezone = config?.timezone || 'Asia/Manila';

  const getFormDefaultValues = () => ({
    title: defaultValues?.title || '',
    subTitle: defaultValues?.subTitle || '',
    start: defaultValues?.start
      ? moment(defaultValues.start).format('YYYY-MM-DDTHH:mm')
      : moment().tz(timezone).format('YYYY-MM-DDTHH:mm'),
    end: defaultValues?.end
      ? moment(defaultValues.end).format('YYYY-MM-DDTHH:mm')
      : '',
    color: defaultValues?.color || '#3B82F6',
    timezone: defaultValues?.timezone || moment.tz.guess(),
    showTime: defaultValues?.showTime ?? true,
    showInTimeline: defaultValues?.showInTimeline ?? true,
    showInCalender: defaultValues?.showInCalender ?? true,
    duration: defaultValues?.metadata?.duration || '',
    iconColor: defaultValues?.metadata?.iconColor || 'primary',
    lineColor: defaultValues?.metadata?.lineColor || 'primary',
    lineType: defaultValues?.metadata?.lineType || 'solid',
    status: defaultValues?.metadata?.status || '',
    component: defaultValues?.metadata?.component || '',
    delayed: defaultValues?.metadata?.delayed || false,
    delayText: defaultValues?.metadata?.delayText || '',
    additionalTime: defaultValues?.metadata?.additionalTime || '',
    passengerName: defaultValues?.metadata?.passengerInfo?.name || '',
    passengerPhone: defaultValues?.metadata?.passengerInfo?.phone || '',
    vehicleModel: defaultValues?.metadata?.vehicleInfo?.model || '',
    vehiclePlate: defaultValues?.metadata?.vehicleInfo?.plate || '',
    vehicleImagePath: defaultValues?.metadata?.vehicleInfo?.imagePath || '',
  });

  const form = useForm<EventFormData>({
    defaultValues: getFormDefaultValues(),
  });

  // Update form values when defaultValues prop changes
  useEffect(() => {
    if (defaultValues) {
      const newValues = getFormDefaultValues();
      form.reset(newValues);
    }
  }, [defaultValues, form]);

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className={cn(`${eventFormType === 'modal' ? '' : 'h-[calc(100dvh-200px)] overflow-y-auto'}`)}> 
        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="h-full space-y-6"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Event subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  rules={{ required: 'Start time is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <h4 className="font-medium">Display Options</h4>
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="showTime"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Show Time
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showInTimeline"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Show in Timeline
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showInCalender"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Show in Calendar
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between"
              >
                Advanced Options
                <Badge variant="secondary">
                  {showAdvanced ? 'Hide' : 'Show'}
                </Badge>
              </Button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-6 border-t pt-6">
                {/* Event Metadata */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <CalendarCheck className="h-5 w-5" />
                    Event Metadata
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2 hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., confirmed, pending"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="iconColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">
                                Secondary
                              </SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lineColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Color</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">
                                Secondary
                              </SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lineType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="component"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Component</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a component" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventComponents.map((component) => {
                              const componentName =
                                component.displayName ||
                                component.name ||
                                'Unknown';
                              return (
                                <SelectItem
                                  key={componentName}
                                  value={componentName}
                                >
                                  {componentName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Delay Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <Clock className="h-5 w-5" />
                    Delay Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="delayed"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Event is delayed
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch('delayed') && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="delayText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delay Text</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 15 minutes late"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., +15 min" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Passenger Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <User className="h-5 w-5" />
                    Passenger Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="passengerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passenger Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passengerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Model</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Toyota Camry"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehiclePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Plate</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABC-1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="vehicleImagePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Image Path</FormLabel>
                        <FormControl>
                          <Input placeholder="Image URL or path" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
      {/* Optional Footer */}
      {showFooter && (
        <div className="flex justify-end gap-2 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" form={formId}>
            {submitButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventForm;
export type { EventFormData, EventFormProps };
