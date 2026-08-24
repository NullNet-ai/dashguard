'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { api } from '~/trpc/react';
import { useToast } from '~/context/ToastProvider';

const FormSchema = z.object({
  latest_version: z
    .string({ message: 'WG Agent Version is required' })
    .min(1, { message: 'WG Agent Version is required' }),
});

interface IProps {
  defaultValues: z.infer<typeof FormSchema>;
}

export default function WGAgentVersionForm({ defaultValues }: IProps) {
  const toast = useToast();
  const updateLatestVersion = api.device.updateLatestVersion.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateLatestVersion.mutateAsync(data);
      if (res.status_code == 200) {
        toast.success('WG Agent Version updated successfully');
      }
      return res;
    } catch (error) {
      toast.error('Failed to update WG Agent Version');
    }
  };

  return (
    <FormBuilder
      enableFormRegisterToParent={false}
      formLabel="Config"
      handleSubmit={handleSave}
      formKey="WGAgentVersion"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'latest_version',
          formType: 'input',
          name: 'latest_version',
          label: 'WG Agent Version',
          required: true,
          placeholder: '1.3.12',
        },
      ]}
    />
  );
}
