'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import { ExternalUserDetailsSchema } from '~/server/zodSchema/account/externalUserDetails';

export default function BasicDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ExternalUserDetailsSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error('Failed to submit Basic Details');
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="basicDetails"
      formSchema={ExternalUserDetailsSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'role',
          formType: 'select',
          name: 'role',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
        {
          id: 'email',
          formType: 'email-input',
          name: 'email',
          label: 'Email',
          required: true,
          placeholder: 'Example: john@example.com',
        },
      ]}
    />
  );
}
