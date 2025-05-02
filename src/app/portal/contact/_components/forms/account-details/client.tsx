'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { type IFormProps } from '../types';
import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation';
import { checkUsernameExist } from './actions';

const account_secret = z
  .string()
  .min(1, { message: 'Please enter your password.' })
  .superRefine((value, ctx) => {
    if (value === '************') {
      return;
    }
    platformPasswordValidator(value, ctx);
  });

const ContactAccountDetailSchema = z
  .object({
    id: z.string().optional(),
    contact_id: z.string(),
    role_id: z.string().min(1, { message: 'Role is required.' }),
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email('Please enter a valid email.'),
    // account_secret: account_secret,
  })
  .superRefine(async (data, ctx) => {
    try {
      // Call the tRPC validation endpoint
      const response = await checkUsernameExist({
        username: data.email as string,
        id: data.id ?? '',
        contact_id: data.contact_id ?? '',
      });
      if (!response?.isValid) {
        ctx.addIssue({
          path: ['account_id'],
          message: 'Email already exists.',
          code: 'custom',
        });
      }
    } catch (error) {
      ctx.addIssue({
        path: ['username'],
        message: 'Error checking Email availability.',
        code: 'custom',
      });
    }
  });

export default function AccountDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateAccountDetails = api.account.updateAccountDetails.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactAccountDetailSchema>>) => {
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
      formSchema={ContactAccountDetailSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      handleSubmit={handleSave}
      fields={[
        {
          id: 'email',
          formType: 'input',
          name: 'email',
          label: 'Email',
          required: true,
          placeholder: 'Enter your email',
        },
        {
          id: 'role_id',
          formType: 'select',
          name: 'role_id',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
        // {
        //   id: 'account_secret',
        //   formType: 'password',
        //   name: 'account_secret',
        //   label: 'Password',
        //   required: true,
        //   placeholder: 'Enter your password',
        //   showPasswordStrengthBar: true,
        //   hasComplexValidation: true,
        // },
      ]}
    />
  );
}
