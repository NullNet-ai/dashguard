'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  device_name: z.string().min(1, 'Device Name is required'),
  device_type: z.string().min(1, 'Device Type is required'),
});

export default function DeviceType({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateDeviceTypeAndName =
    api.device.updateDeviceTypeAndName.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await updateDeviceTypeAndName.mutateAsync({
        id: params.id,
        ...data,
      });
    } catch (error) {
      toast.error('Failed to update device type and name');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Device Details"
      handleSubmit={handleSave}
      formKey="deviceType"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'device_name',
          formType: 'input',
          name: 'device_name',
          label: 'Device Name',
          description: 'Device Name',
          placeholder: '',
          fieldClassName: '',
          fieldStyle: {},
          required: true,
        },
        {
          id: 'device_type',
          formType: 'select',
          name: 'device_type',
          label: 'Device Type',
          description: 'Device Type',
          placeholder: '',
          fieldClassName: '',
          fieldStyle: {},
          required: true,
        },
      ]}
      checkboxOptions={{}}
      radioOptions={{}}
      multiSelectOptions={{}}
      selectOptions={selectOptions}
    />
  );
}
