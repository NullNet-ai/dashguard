'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import CustomCategoryDetails from './CustomCategoryDetails';

const FormSchema = z.object({
  categories: z.string().min(1, { message: 'Category is required' }),
});

export default function CategoryDetails({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organizations',
        data: {
          categories: [data.categories],
        },
      });

      if (response) {
        toast.success('Category details submitted successfully');
      }
    } catch (error) {
      toast.error('Failed to submit category details');
    }
  };

  return (
    <FormBuilder
      enableFormRegisterToParent
      myParent={params.shell_type}
      formProps={params}
      formLabel="Category Details"
      handleSubmit={handleSave}
      formKey="category_details"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form) => <CustomCategoryDetails form={form} />}
    />
  );
}
