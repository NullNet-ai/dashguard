'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { type IFormProps } from '../types';
import { UpdateCommunicationTemplate } from './actions/updateCommunication';
import { api } from '~/trpc/react';
import { useFormNavigationStateMachine } from '~/components/platform/FormBuilder/Utils/formNavigation';

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string( {required_error: 'Name is required'}).min(1, { message: 'Name is required'}),
});

export default function FormLabel({ params, defaultValues }: IFormProps) {
  const toast = useToast();
  const updateCommunicationTemplate = api.communicationTemplate.updateDraftTemplate.useMutation();
  const { handleFormSubmission } = useFormNavigationStateMachine();

  const handleSave = async ({
    data,
    action_type
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      // await UpdateCommunicationTemplate({
      //   id: params.id,
      //   name: data.name,
      // });
      // toast.success('Basic Details submitted successfully.');
      await handleFormSubmission({
        action_type,
        stateMachine: {
          create: {
            invoke: async (): Promise<{ code: string; data: any }> => {
              const response = await updateCommunicationTemplate.mutateAsync({
                ...data
              });

              return {
                code: response?.code!,
                data: response,
              };
            },
            validate: async (response) => {
              return null
            },
            toast_message: 'Basic Details submitted successfully.',
          },
          update: {
            invoke: async (): Promise<{ code: string; data: any }> => {
              const response = await updateCommunicationTemplate.mutateAsync({
                ...data
              });
              return {
                code: response?.code!,
                data: response,
              };
            },
            validate: async (response) => {
              return null
            },
            toast_message: 'Basic Details submitted successfully.',
          },
          wizard: {
            new: {},
            code: {},
          },
          record: true,
        },
      });
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return;
      toast.error('Failed to submit Basic Details');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      enableFormRegisterToParent={true}
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
