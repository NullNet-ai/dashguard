'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';

const FormSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' }),
});

export default function DeviceGroupBasicDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateDeviceGroup = api.deviceGroup.update.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateDeviceGroup.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res.status_code == 200) {
        toast.success('Device Group details submitted successfully');
      }
      return res;
    } catch (error) {
      toast.error('Failed to submit Device Group details');
    }
  };

  return (
    <>
      <FormBuilder
        myParent={params.shell_type}
        enableFormRegisterToParent
        formProps={params}
        formLabel="Basic Details"
        handleSubmit={handleSave}
        formKey="DeviceGroupBasicDetails"
        formSchema={FormSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: 'name',
            formType: 'input',
            name: 'name',
            label: 'Device Group',
            required: true,
            placeholder: 'Device Group',
          },
        ]}
      />
    </>
  );
}
