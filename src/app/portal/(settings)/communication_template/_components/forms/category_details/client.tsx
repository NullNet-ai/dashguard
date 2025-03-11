'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, { message: 'Category is required' }),
});

export default function CategoryDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await update.mutateAsync({
        id: params?.id,
        data: {
          categories: [data.category],
        },
        entity: params?.entity!,
      });
      toast.success('Category submitted successfully.');
    } catch {
      toast.error('Failed to submit Category Details');
    }
  };

  return (
    <FormBuilder
      enableFormRegisterToParent
      myParent={params.shell_type}
      formProps={params}
      formLabel="Category Details"
      handleSubmit={handleSave}
      formKey="CategoryDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'category',
          formType: 'radio',
          name: 'category',
          label: 'Category',
          radioOrientation: 'vertical',
          required: true,
        },
      ]}
      radioOptions={{
        category: [
          { value: 'Email', label: 'Email' },
          { value: 'In App', label: 'In App' },
          { value: 'SMS', label: 'SMS' },
        ],
      }}
    />
  );
}
