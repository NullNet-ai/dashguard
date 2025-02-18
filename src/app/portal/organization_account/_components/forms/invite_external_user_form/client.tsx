'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import { ExternalUserDetailsSchema } from '~/server/zodSchema/account/externalUserDetails';

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ExternalUserDetailsSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          role_id: data.role,
          email: data.email?.[0]?.email,
        },
      });
      if (response) {
        toast.success('External User details submitted successfully');
        return response;
      }
    } catch (error) {
      toast.error('Failed to submit External User details');
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel={
        params.shell_type === 'record'
          ? 'Account Details'
          : 'Invite External User'
      }
      handleSubmit={handleSave}
      formKey="UserDetails"
      formSchema={ExternalUserDetailsSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
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
      buttonConfig={{
        hideLockButton: params.shell_type === 'record',
      }}
    />
  );
}
