'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { FormBuilder } from '~/components/platform/FormBuilder';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

import CustomSetupDetails from '../_custom/SetupDetails';
import { type IFormProps } from '../types';

export default function SetupDetails({ params, defaultValues }: IFormProps) {
  const form = useForm();

  const handleSave = async () => {
    form.setValue('app_secret', '', {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'lg:grid-cols-1 grid-cols-1',
      }}
      customRender={(
        form: UseFormReturn<Record<string, any>, any, undefined>,
      ) => (
        <CustomSetupDetails
          form={form}
          params={params}
          defaultValues={defaultValues}
        />
      )}
      buttonConfig={{
        hideLockButton: params?.shell_type === 'record' ? false : true,
      }}
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      fields={[]}
      formKey="setup_details"
      formLabel="Setup"
      formProps={params}
      formSchema={z.object({})}
      handleSubmit={handleSave}
      myParent={params.shell_type}
      features={{
        enableFormHostViewActions: false
      }}
    />
  );
}
