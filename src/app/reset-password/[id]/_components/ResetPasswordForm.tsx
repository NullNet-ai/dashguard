'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword';
import { Button } from '~/components/ui/button';
import { Form, FormField, FormMessage } from '~/components/ui/form';
import { resetPassword } from '../actions/resetPassword';

const ResetPasswordFormSchema = z.object({
  new_password: z.string(),
});

const ResetPasswordForm = ({ account_id }: { account_id: string }) => {
  const form = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await resetPassword({
        account_secret: data.new_password as string,
        id: account_id!,
      });
    } catch (error: unknown) {
      setError('Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          form.handleSubmit(onSubmit)(event);
        }}
      >
        <FormField
          control={form.control}
          name="new_password"
          render={(formProps) => {
            return (
              <FormPassword
                fieldConfig={{
                  id: 'new_password',
                  name: 'new_password',
                  label: 'New Password',
                  required: true,
                  placeholder: 'Enter your password',
                  type: 'text',
                  showPasswordStrengthBar: true,
                  hasComplexValidation: true,
                }}
                form={form}
                formKey="ResetPassword"
                formRenderProps={formProps}
              />
            );
          }}
        />
        {error && <FormMessage>{error}</FormMessage>}
        <Button
          className={
            'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'
          }
          data-test-id="login-submit-button"
          loading={isSubmitting}
          type="submit"
        >
          Set Password
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
