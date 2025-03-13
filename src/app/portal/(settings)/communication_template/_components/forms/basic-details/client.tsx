'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { UpdateCommunicationTemplate } from './actions/updateCommunication';

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string( {required_error: 'Name is required'}).min(1, { message: 'Name is required'}),
});

export default function FormLabel({ params, defaultValues }: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      await UpdateCommunicationTemplate({
        id: params.id,
        name: data.name,
      });
      toast.success('Basic Details submitted successfully.');
    } catch {
      toast.error('Failed to submit Basic Details');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Basic Details"
      handleSubmit={handleSave}
      formKey="BasicDetails"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'name',
          formType: 'input',
          name: 'name',
          label: 'Name',
          placeholder: 'Example: Account Invitation',
          required: true,
        },
      ]}
    />
  );
}
