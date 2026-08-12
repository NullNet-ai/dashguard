'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import CustomComponent from '../_components/custom-component';
import { useState, use } from 'react';
import MultiFieldsCustom from '../_components/multi-fields-custom';

const FormSchema = z.object({
  'otp-input': z.string().min(1, 'Invalid code. Please try again.').min(6, 'Invalid code. Please try again').max(6, 'Invalid code. Please try again.'),
  'otp-input-single-field': z.string().min(1, 'Invalid code. Please try again.').min(6, 'Invalid code. Please try again').max(6, 'Invalid code. Please try again.'),
});

export default function Page(props: any) {
  const params = use(props.params) as { shell_type?: "wizard" | "record" };

  const {
    defaultValues
  } = props;

  const toast = useToast();
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error('Failed to submit Form Label');
    }
  };

  return (
    <FormBuilder

      myParent={params.shell_type}
      formProps={params}
      formLabel="OTP Input Form"
      handleSubmit={handleSave}
      formKey="otp-input-form"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'otp-input',
          formType: 'otp-input',
          name: 'otp-input',
          label: 'OTP Input Multiple Fields',
          description: 'Enter the OTP code sent to your email',
          placeholder: '',
          fieldClassName: '',
          otpInputConfig: {
            length: 6,
            showCounter: true,
            placeholderChar: '•',
            //custom onComplete
            onComplete: (value: string) => { 
              // Handle OTP completion outside logic
            },
          },
        },
        {
          id: 'otp-input-single-field',
          formType: 'otp-input',
          name: 'otp-input-single-field',
          label: 'OTP Input Single Field',
          description: 'Enter the OTP code sent to your email',
          placeholder: '',
          fieldClassName: '',
          otpInputConfig: {
            length: 6,
            showCounter: true,
            placeholderChar: '•',
            variant: 'single',
            //custom onComplete
            onComplete: (value: string) => { 
              // Handle OTP completion outside logic
            },
          },
        },
      ]}
    />
  );
}
