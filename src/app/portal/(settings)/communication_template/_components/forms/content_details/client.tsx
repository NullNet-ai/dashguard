'use client';

import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import Entities from '~/auto-generated/entities';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import { type IFormProps } from '../types';
import ContentField from './custom/ContentSubjectField';
import { formatTabName } from '~/lib/utils';

const additionalSourceData = [
  {
    label: 'Link',
    value: 'link',
    custom: true
  },
];

export default function Content({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const update = api.record.updateDynamicRecord.useMutation();

  const FormSchema = z.object({
    ...(category !== 'SMS'
      ? {
          subject: z
            .string({ required_error: 'Subject is required' })
            .min(1, { message: 'Subject is required' }),
        }
      : {}),
    content: z
      .string({ required_error: 'Content is required' })
      .min(1, { message: 'Content is required' }),
  });

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await update.mutateAsync({
        id: params?.id,
        data: {
          subject: data.subject,
          content: data.content,
        },
        entity: params?.entity!,
      });
      toast.success('Content Details submitted successfully.');
    } catch (error) {
      toast.error('Failed to submit Content Details');
    }
  };

  const data_source = Entities.map((entity) => ({
    value: entity,
    label: formatTabName(entity),
  }));

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      enableFormRegisterToParent
      myParent={params.shell_type}
      formProps={params}
      formLabel="Content"
      handleSubmit={handleSave}
      formKey="content"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'subject',
          formType: 'custom-field',
          name: 'subject',
          label: 'Subject',
          required: true,
          hasFormMessage: false,
          render: ContentField,
        },
        {
          id: 'content',
          formType: 'custom-field',
          name: 'content',
          label: 'Content',
          fieldClassName: '',
          required: true,
          hasFormMessage: false,
          render: ContentField,
        },
      ]}
      selectOptions={{
        data_source: [...data_source, ...additionalSourceData],
      }}
    />
  );
}
