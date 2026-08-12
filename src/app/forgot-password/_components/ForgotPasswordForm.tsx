'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Form, FormField, FormMessage } from '~/components/ui/form';

import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';
import { sendForgotPasswordEmail } from '../_actions/sendForgotPasswordEmail';
import { useSocket } from '~/context/SocketProvider';
import { useRouter } from 'next/navigation';
import { handleEvent } from '~/server/events';
import { EEventType } from '~/server/events/types';

const ForgotPasswordFormSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email()
    .min(1, 'Email is required'),
});

const ForgotPasswordForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
  });
  const socketClient = useSocket();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await sendForgotPasswordEmail({
        email: data.email,
      });
      if (response) {
        await handleEvent(EEventType.RESET_PASSWORD, response);
        router.push('/forgot-password/submit-success');
        // socketClient.publish({
        //   type: 'RESET_PASSWORD',
        //   payload: response,
        // });
      }
      setIsSubmitting(false);
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
          name="email"
          render={(formProps) => {
            return (
              <FormInput
                fieldConfig={{
                  id: 'email',
                  name: 'email',
                  label: 'Email',
                  required: true,
                  placeholder: 'Enter your email',
                  type: 'email',
                }}
                form={form}
                formKey="Email"
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
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
