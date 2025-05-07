'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  category: z.string(),
});

export default function LocationCategory({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'location',
        data : {
          categories : [data.category]
        }
      });
      if (response?.success) {
        const { data } = response;
        toast.success("Location Category submit successfully");
        return data;
      }
      throw new Error("Failed to submit Location Category");
    } catch (error) {
      toast.error('Failed to submit Location Category');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Location Category"
      handleSubmit={handleSave}
      formKey="locationcategory"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'category',
          formType: 'radio',
          name: 'category',
          label: 'Category',
          description: 'Field Description',
          placeholder: '',
          fieldClassName: '',
          fieldStyle: {},
        },
      ]}
      checkboxOptions={{}}
      radioOptions={{
        category: [
          {
            label: 'Classroom',
            value: 'Classroom',
          },
          {
            label: 'Area',
            value: 'Area',
          },
          {
            label: 'Counter',
            value: 'Counter',
          },
        ],
      }}
      selectOptions={{}}
      multiSelectOptions={{}}
    />
  );
}
