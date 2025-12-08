'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  location_id: z.string(),
  details: z.object({
    address: z.string(),
    address_line_one: z.string().optional(),
    address_line_two: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    place_id: z.string().optional(),
    street_number: z.string().optional(),
    street: z.string().optional(),
    region: z.string().optional(),
    region_code: z.string().optional(),
    country_code: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
  }),
});

export default function FormLabel({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.location.saveLocationAddress.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: defaultValues?.location_id,
        address_id: defaultValues?.address_id,
        details : data.details ?? {}
      })
      if (response?.success) {
        const { data } = response;
        toast.success("Location Details submit successfully");
        return data;
      }
      throw new Error("Failed to submit Location Details");
    } catch (error) {
      toast.error('Failed to submit Form Label');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Form Address"
      handleSubmit={handleSave}
      formKey="LocationAddress"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'location_address',
          formType: 'address-input',
          name: 'location_address',
          label: 'Location Address',
          description: 'Field Description',
          placeholder: 'Enter Location Address',
          fieldClassName: '',
          accuracy: 10,
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
