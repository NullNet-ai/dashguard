'use client';

import { FormBuilder } from '~/components/platform/FormBuilder';
import {
  AccountDetailSchema,
  ContactAccountDetailsSchema,
} from '~/server/zodSchema/contact/accountDetails';
import AccountDetailsForm from '../_custom/AccountDetailsForm';
import { type IFormProps } from '../types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { z } from 'zod';
import { IHandleSubmit } from '~/components/platform/FormBuilder/types';

export default function AccountDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateAccountDetails = api.account.updateAccountDetails.useMutation();
  
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof AccountDetailSchema>>) => {
    try {
      const response = await updateAccountDetails.mutateAsync({
        ...data,
        contact_id: params?.id,
      });

      if (response) {
        toast.success('Account Details submit successfully');
        return response;
      }
      throw new Error('Failed to submit Account Details');
    } catch (error) {
      // setIsSaving(false);
      toast.error('Failed to submit Account Details');
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent={false}
      formProps={params}
      formLabel="Account Details"
      formKey="account_details"
      formSchema={AccountDetailSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      // appendFormKey="add_account"
      handleSubmit={handleSave}
      // customRender={(form, options) => (
      //   <AccountDetailsForm
      //     form={form}
      //     selectOptions={selectOptions}
      //     formSchema={ContactAccountDetailsSchema}
      //     appendFormKey={options?.appendButtonKey || ""}
      //     formProps={params}
      //     defaultValues={defaultValues}
      //   />
      // )}
      // features={{
      //   enableFormHostViewActions: false,
      // }}
      // customDesign={{
      //   formClassName: 'lg:grid-cols-1 sm:grid-cols-1 ',
      // }}
      // buttonConfig={{
      //   hideLockButton: true,
      // }}
      fields={[
        {
          id: 'organization_id',
          name: 'organization_id',
          formType: 'select',
          label: 'Organization',
          required: false,
          isCustomFormField: true,
          ...(params.shell_type === 'record'
            ? {
                readonly: true,
              }
            : {}),
        },
        {
          id: 'role_id',
          formType: 'select',
          name: 'role_id',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
        {
          id: 'account_id',
          formType: 'input',
          name: 'account_id',
          label: 'Username',
          required: true,
          placeholder: 'Enter your username',
        },
        {
          id: 'account_secret',
          formType: 'password',
          name: 'account_secret',
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
