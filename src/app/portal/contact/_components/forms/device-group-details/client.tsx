'use client';

import { type z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { ContactDeviceGroupDetailsSchema } from '~/server/zodSchema/contact/deviceGroupDetails';

export default function DeviceGroupDetails({
  params,
  defaultValues,
  selectOptions,
  multiSelectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateDeviceGroup = api.contactDevice.setDeviceGroups.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactDeviceGroupDetailsSchema>>) => {
    try {
      const { device_groups } = data;
      const response = await updateDeviceGroup.mutateAsync({
        group_ids: device_groups?.map((itm) => itm.value) ?? [],
        contact_id: params.id,
      });
      if (response) {
        toast.success('Device Group Details submit successfully');
        return response;
      }
      throw new Error('Failed to submit Device Group Details');
    } catch (error) {
      toast.error('Failed to submit Device Group Details');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      enableFormRegisterToParent={true}
      formProps={params}
      formLabel="Device Groups"
      handleSubmit={handleSave}
      formKey="device_group_details"
      formSchema={ContactDeviceGroupDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={multiSelectOptions}
      selectOptions={selectOptions}
      fields={[
        {
          id: 'device_groups',
          formType: 'multi-select',
          name: 'device_groups',
          label: 'Device Groups',
          required: false
        },
      ]}
    />
  );
}
