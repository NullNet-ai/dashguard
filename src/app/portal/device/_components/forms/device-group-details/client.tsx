'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';

interface DeviceGroupDetailsClientProps {
  deviceId: string;
  multiSelectOptions: Array<{ label: string; value: string }>;
  selectedGroupIds: string[];
}

const FormSchema = z.object({
  device_group_ids: z.array(z.string()).optional().default([]),
});

export function DeviceGroupDetailsClient({
  deviceId,
  multiSelectOptions,
  selectedGroupIds,
}: DeviceGroupDetailsClientProps) {
  const toast = useToast();
  const setDeviceGroups = api.deviceGroup.setDeviceGroups.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await setDeviceGroups.mutateAsync({
        device_id: deviceId,
        group_ids: data.device_group_ids || [],
      });
      toast.success('Device groups updated successfully');
      return res;
    } catch (error) {
      toast.error('Failed to update device groups');
    }
  };

  return (
    <FormBuilder
      myParent="record"
      enableFormRegisterToParent
      formProps={{ id: deviceId, shell_type: 'record', entity: 'device' }}
      formLabel="Device Groups Details"
      handleSubmit={handleSave}
      formKey="DeviceGroupDetails"
      formSchema={FormSchema}
      defaultValues={{ device_group_ids: selectedGroupIds }}
      multiSelectOptions={{ device_group_ids: multiSelectOptions }}
      fields={[
        {
          id: 'device_group_ids',
          formType: 'multi-select',
          name: 'device_group_ids',
          label: 'Device Groups',
          required: false,
          multiSelectUseStringValues: true,
        },
      ]}
    />
  );
}
