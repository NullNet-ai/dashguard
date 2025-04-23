'use client';

import { UserPlusIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { Control, FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';
import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword';
import { Button } from '~/components/ui/button';
import { Form, FormMessage } from '~/components/ui/form';

import registerAccount from '../_actions/registerAccount';

import SignUpFormField from './SignUpFormField';
import { platformPasswordValidator } from '~/components/platform/FormBuilder/Utils/platformPasswordValidation';
import registerAccountFromInvite from '~/app/invite/[id]/_actions/registerAccountFromInvite';

const SignUpSchema = z
  .object({
    organization_name: z.string().default('My Organization'),
    first_name: z.string().min(1, { message: 'Please enter your first name.' }),
    last_name: z.string().min(1, { message: 'Please enter your last name.' }),
    email: z
      .string()
      .min(1, { message: 'Please enter your email address.' })
      .email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(1, { message: 'Please enter your password.' })
      .superRefine((value, ctx) => {
        platformPasswordValidator(value, ctx);
      }),
    confirmed_password: z
      .string()
      .min(1, { message: 'Please re-enter your password.' }),
  })
  .refine((data) => data.password === data.confirmed_password, {
    message: `Oops! Your password doesn't match. Please check and try again.`,
    path: ['confirmed_password'],
  });

interface SignUpFormProps {
  recordData?: Record<string, any>;
  account_id?: string;
  invitation_id?: string;
  is_invited?: boolean;
}

const SignUpForm = (props: SignUpFormProps) => {
  const { recordData, account_id, invitation_id, is_invited } = props;
  const form = useForm({
    defaultValues: {
      organization_name: recordData?.organization_name,
      first_name: recordData?.first_name || '',
      last_name: recordData?.last_name || '',
      email: recordData?.email || '',
      password: '',
      confirmed_password: '',
    },
    resolver: zodResolver(SignUpSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const registrationData = omit(data, ['confirmed_password']) as {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
      organization_name?: string;
    };

    try {
      if (account_id && is_invited) {
        registerAccountFromInvite({
          ...registrationData,
          account_id,
          organization_id: recordData?.organization_id,
          invitation_id
        });
        return;
      }
      await registerAccount(registrationData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className={'space-y-6'}
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
      >
        <SignUpFormField
          control={form.control as unknown as Control<FieldValues, any>}
          fields={[
            {
              FormComponent: FormInput,
              name: 'organization_name',
              id: 'organization_name',
              label: 'Organization Name',
              placeholder: 'Example: DNA Micro',
              type: 'text',
              readonly: !!recordData?.organization_name,
            },
            {
              FormComponent: FormInput,
              name: 'first_name',
              id: 'first_name',
              label: 'First Name',
              placeholder: 'Example: John',
              type: 'text',
              required: true,
            },
            {
              FormComponent: FormInput,
              name: 'last_name',
              id: 'last_name',
              label: 'Last Name',
              placeholder: 'Example: John',
              type: 'text',
              required: true,
            },
            {
              FormComponent: FormInput,
              name: 'email',
              id: 'email',
              label: 'Email',
              placeholder: 'Example: john@example.com',
              type: 'email',
              required: true,
              readonly: !!recordData?.email,
            },
            {
              FormComponent: FormPassword,
              name: 'password',
              id: 'password',
              label: 'New Password',
              placeholder: 'Enter your password',
              type: 'text',
              required: true,
              showPasswordStrengthBar: true,
              hasComplexValidation: true,
            },
            {
              FormComponent: FormPassword,
              name: 'confirmed_password',
              id: 'confirmed_password',
              label: 'Confirm Password',
              placeholder: 'Enter your password',
              type: 'text',
              required: true,
            },
          ]}
          form={form as unknown as UseFormReturn<FieldValues, any, undefined>}
          formKey="SignUp"
        />
        {error && <FormMessage>{error}</FormMessage>}
        <Button
          className={
            'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'
          }
          data-test-id="login-submit-btn"
          loading={isSubmitting}
          type="submit"
        >
          <UserPlusIcon className="mr-2 h-5 w-5" />
          Create Account
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
