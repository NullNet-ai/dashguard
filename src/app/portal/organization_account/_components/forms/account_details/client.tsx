'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import { AccountDetailSchema } from '~/server/zodSchema/account/internalUserDetails';

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const update = api.account.updateUserAccountRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof AccountDetailSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          account_id: data.username,
          account_secret: data.password,
          role_id: data.role,
          is_new_user: true,
          email: data.username,
          password: data.password,
        },
      });
      if (response) {
        toast.success('Account details submitted successfully');
        return response;
      }
    } catch (error) {
      toast.error('Failed to submit Account Details');
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      formProps={params}
      enableFormRegisterToParent
      formLabel="Account Details"
      handleSubmit={handleSave}
      formKey="AccountDetails"
      formSchema={AccountDetailSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: 'username',
          formType: 'input',
          name: 'username',
          label: 'Username',
          required: true,
          placeholder: 'Enter your username',
        },
        {
          id: 'role',
          formType: 'select',
          name: 'role',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
        {
          id: 'password',
          formType: 'password',
          name: 'password',
          label: 'Password',
          required: true,
          placeholder: 'Enter your password',
          showPasswordStrengthBar: true,
          hasComplexValidation: true,
        },
      ]}
    />
  );
}
