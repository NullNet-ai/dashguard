'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { api } from '~/trpc/react';
import Entities from '~/auto-generated/entities';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';
import FormRichTextEditor from '~/components/platform/FormBuilder/FormType/FormRichTextEditor';
import { useEffect } from 'react';
import SubjectField from './custom/SubjectField';
import ContentField from './custom/ContentField';
import VariableField from './custom/VariableField';

const FormSchema = z.object({
  data_source: z.string(),
  variables: z.string(),
  subject: z.string(),
  content: z.string({ message: 'RichTextEditor is required' }),
});

export default function Content({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error('Failed to submit Content');
    }
  };

  const data_source = Entities.map((entity) => ({
    value: entity,
    label: entity,
  }));

  const entityFields = {
    contact: [
      'contact.first_name',
      'contact.last_name',
      'contact.status',
      'contact.code',
    ],
    organization_account: [
      'organization_account.account_id',
      'organization_account.status',
      'organization_account.code',
      'organization_account.account_status',
    ],
  };

  const variables = Object.entries(entityFields).map(([entity, fields]) => ({
    value: entity,
    label: entity,
    options: fields.map((field) => ({
      value: field,
      label: field,
    })),
  }));

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-4 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Content"
      handleSubmit={handleSave}
      formKey="content"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'subject_data_source',
          formType: 'select',
          name: 'subject_data_source',
          label: 'Data Source',
        },
        {
          id: 'subject_variables',
          formType: 'custom-field',
          name: 'subject_variables',
          label: 'Variables',
          render: VariableField
        },
        {
          id: 'field_1741658522049',
          formType: 'space',
          name: 'field_1741658522049',
          label: 'New Field 3',
          description: 'Field Description',
        },
        {
          id: 'field_1741658523708',
          formType: 'space',
          name: 'field_1741658523708',
          label: 'New Field 4',
        },
        {
          id: 'subject',
          formType: 'custom-field',
          name: 'subject',
          label: 'Subject',
          required: true,
          fieldStyle: {
            gridColumn: '1 / span 4',
            gridRow: '2 / span 1',
          },
          render: SubjectField
        },
        {
          id: 'field_1741724185290',
          formType: 'separator',
          name: 'field_1741724185290',
          label: 'New Field 9',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          fieldStyle: {
            gridColumn: '1 / span 4',
            gridRow: '3 / span 1',
          },
        },
        {
          id: 'content_data_source',
          formType: 'select',
          name: 'content_data_source',
          label: 'Data Source',
        },
        {
          id: 'content_variables',
          formType: 'custom-field',
          name: 'content_variables',
          label: 'Variables',
          render: VariableField
        },
        {
          id: 'field_1741658522043',
          formType: 'space',
          name: 'field_1741658522043',
          label: 'New Field 3',
          description: 'Field Description',
        },
        {
          id: 'field_1741658523704',
          formType: 'space',
          name: 'field_1741658523704',
          label: 'New Field 4',
        },
        {
          id: 'content',
          formType: 'custom-field',
          name: 'content',
          label: 'Content',
          fieldClassName: '',
          required: true,
          fieldStyle: {
            gridColumn: '1 / span 4',
            gridRow: '5 / span 1',
          },
          render: ContentField
        },
      ]}
      selectOptions={{
        subject_data_source: data_source,
        content_data_source: data_source,
        variables,
      }}
    />
  );
}
