'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import { Button } from '~/components/ui/button';
import { Form, FormField, FormMessage } from '~/components/ui/form';
import redirectToSignIn from '../_actions/redirectToSignIn';
import loginOrganization from '../_actions/logInOrganization';
import { Alert, AlertContent } from '~/components/ui/alert';

const LoginOrganizationFormSchema = z.object({
  organization: z
    .string()
    .min(1, { message: 'Organization name is required.' }),
});

const LoginOrganizationForm = ({ defaultValues, selectOptions }: any) => {
  const form = useForm({
    resolver: zodResolver(LoginOrganizationFormSchema),
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await loginOrganization(data.organization);
      if (response && !response.valid && response.errorMessage) {
        setErrorMessage(response.errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedirectToSignIn = async () => {
    await redirectToSignIn();
  };

  return (
    <>
      {errorMessage && (
        <Alert variant="error" className="mb-3">
          <AlertContent>{errorMessage}</AlertContent>
        </Alert>
      )}
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="organization"
            render={(formProps) => {
              return (
                <FormSelect
                  fieldConfig={{
                    selectSearchable: true,
                    id: 'organization',
                    name: 'organization',
                    label: 'Organization',
                    required: true,
                    placeholder: 'Select Organization',
                  }}
                  form={form}
                  formKey="LoginOrganization"
                  formRenderProps={formProps}
                  selectOptions={selectOptions}
                />
              );
            }}
          />
          {error && <FormMessage>{error}</FormMessage>}
          <div className="flex justify-between gap-4">
            <Button
              className="flex h-auto w-full items-center justify-center gap-3 rounded py-1.5 text-md font-semibold text-foreground"
              type="button"
              onClick={handleRedirectToSignIn}
              variant={'outline'}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="flex h-auto w-full items-center justify-center gap-3 rounded py-1.5 text-md font-semibold shadow-sm"
              data-test-id="login-submit-btn"
              loading={isSubmitting}
              type="submit"
              variant={'default'}
            >
              Proceed
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default LoginOrganizationForm;
