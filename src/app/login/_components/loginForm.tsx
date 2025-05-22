'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';
import FormPassword from '~/components/platform/FormBuilder/FormType/FormPassword';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Form, FormField, FormMessage } from '~/components/ui/form';

import LoginSubmit from '../_actions/loginSubmit';
import { Alert, AlertContent } from '~/components/ui/alert';

const formSchema = z.object({
  username: z
    .string({ required_error: 'Email is required.' })
    .email('Please enter a valid email.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, { message: 'Please enter your password.' }),
});

export default function LoginForm(props: any) {
  const { defaultValues, invitation_id } = props;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await LoginSubmit({ ...data, invitation_id });
      if (response && (response.statusCode !== 200 || !response.valid)) {
        if (response.errorMessage) {
          setErrorMessage(response.errorMessage);
        }
        throw response;
      }
    } catch (error: any) {
      console.error('Error Details:', error.message);
      setIsSubmitting(false);
      try {
        const parsedError = JSON.parse(error.message);
        setError(parsedError?.[0]?.message);
      } catch {
        setError(error.message);
      }
    }
  };

  return (
    <>
      {errorMessage && (
        <Alert variant="error" className="mb-3">
          <AlertContent>{errorMessage}</AlertContent>
        </Alert>
      )}
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            form.handleSubmit(onSubmit)(event);
          }}
        >
          <FormField
            control={form.control}
            name="username"
            render={(formProps) => {
              return (
                <FormInput
                  fieldConfig={{
                    id: 'username',
                    name: 'username',
                    label: 'Email',
                    required: true,
                    placeholder: 'Enter your email',
                    type: 'text',
                  }}
                  form={form}
                  formKey="Login"
                  formRenderProps={formProps}
                />
              );
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={(formProps) => {
              return (
                <FormPassword
                  fieldConfig={{
                    id: 'password',
                    name: 'password',
                    label: 'Password',
                    required: true,
                    placeholder: 'Enter at least 5 characters',
                  }}
                  form={form}
                  formKey="Login"
                  formRenderProps={formProps}
                />
              );
            }}
          />
          {error && <FormMessage>{error}</FormMessage>}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                data-test-id="login-rmmbr-me-chkbx"
              />
              <label
                className="ml-2 block text-md font-semibold text-foreground"
                htmlFor="rememberMe"
              >
                Remember me
              </label>
            </div>
            <div className="text-md">
              <a
                className="font-semibold text-primary"
                href="forgot-password"
                data-test-id="login-frgt-pswrd-link"
              >
                Forgot Password?
              </a>
            </div>
          </div>
          <Button
            className={
              'justify-center\\\\ !mt-8 flex h-auto w-full items-center rounded py-1.5 text-md font-semibold text-white shadow-sm'
            }
            data-test-id="login-submit-btn"
            loading={isSubmitting}
            type="submit"
          >
            Sign in
          </Button>
        </form>
      </Form>
    </>
  );
}
