'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from "~/trpc/react";
import countries from 'public/countries.json';

const addressCountryOptions = (countries as Array<{ name: string; code: string }>)
  .map((country) => ({
    label: country.name,
    value: country.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const FormSchema = z.object({
  device_category: z.string().min(1, 'Device Category is required'),
  address_country: z.string().min(1, 'Country is required'),
});

export default function DeviceCategory({ params, defaultValues }: IFormProps) {
  const toast = useToast();

  const updateDeviceCategory = api.device.updateDeviceCategory.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await updateDeviceCategory.mutateAsync({
        id: params.id,
        ...data,
      });
    } catch (error) {
      toast.error('Failed to update device category');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Device Category"
      handleSubmit={handleSave}
      formKey="deviceCategoryForm"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'device_category',
          formType: 'radio',
          name: 'device_category',
          label: 'Device Category',
          description: 'Field Description',
          placeholder: '',
          fieldClassName: '',
          radioOrientation: 'vertical',
          fieldStyle: {},
          required: true,
        },
        {
          id: 'address_country',
          formType: 'select',
          name: 'address_country',
          label: 'Country',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          readonly: false,
          required: true,
          selectSearchable: true,
          fieldStyle: {
            gridColumn: '1 / span 2',
            gridRow: '3 / span 1',
          },
        },
      ]}
      checkboxOptions={{}}
      radioOptions={{
        device_category: [
          {
            label: 'AppGuard Client',
            value: 'AppGuard Client',
          },
          {
            label: 'Firewall',
            value: 'Firewall',
          },
          {
            label: 'Load Balancer',
            value: 'Load Balancer',
          },
        ],
      }}
      selectOptions={{
        address_country: addressCountryOptions,
      }}
      multiSelectOptions={{}}
    />
  );
}
