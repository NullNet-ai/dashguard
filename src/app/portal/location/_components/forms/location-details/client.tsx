'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  location_name: z.string().min(1, 'Location Name is required.'),
});

export default function LocationDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'location',
        data: {
          location_name: data.location_name,
        },
      })
      if (response?.success) {
        const { data } = response;
        toast.success("Location Details submit successfully");
        return data;
      }
      throw new Error("Failed to submit Location Details");
    } catch (error) {
      toast.error('Failed to submit Location Details');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Location Details"
      handleSubmit={handleSave}
      formKey="locationdetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'location_name',
          formType: 'input',
          name: 'location_name',
          label: 'Location Name',
          description: 'Field Description',
          placeholder: 'Enter Location Name',
          fieldClassName: '',
          required: true,
          fieldStyle: {},
        },
      ]}
      checkboxOptions={{}}
      radioOptions={{}}
      selectOptions={{}}
      multiSelectOptions={{}}
    />
  );
}
