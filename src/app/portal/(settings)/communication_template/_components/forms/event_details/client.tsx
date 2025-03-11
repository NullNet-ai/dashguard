'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import { getEventTypes } from '~/server/events';

const FormSchema = z.object({
  event: z.string({ required_error: 'Event is required' }),
});

export default function FormLabel({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await update.mutateAsync({
        id: params?.id,
        data: {
          event: data.event,
        },
        entity: params?.entity!,
      });
      toast.success('Event submitted successfully.');
    } catch (error) {
      toast.error('Failed to submit Event.');
    }
  };

  const eventOptions = getEventTypes().map((event) => ({
    label: event,
    value: event,
  }))

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      enableFormRegisterToParent
      myParent={params.shell_type}
      formProps={params}
      formLabel="Event"
      handleSubmit={handleSave}
      formKey="EventDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'event',
          formType: 'select',
          name: 'event',
          label: 'Event',
          placeholder: 'Search for an event',
          selectSearchable: true,
          required: true,
        },
      ]}
      selectOptions={{
        event: eventOptions,
      }}
    />
  );
}
