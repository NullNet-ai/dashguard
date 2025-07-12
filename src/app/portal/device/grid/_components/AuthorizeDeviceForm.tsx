'use client';

import { FormBuilder } from '~/components/platform/FormBuilder';
import { z } from 'zod';
import { api } from '~/trpc/react';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import { toast } from 'sonner';
import { IHandleSubmit } from '~/components/platform/FormBuilder/types';

const FormSchema = z.object({
  device_name: z
    .string({ message: 'Device Name is required' })
    .min(1, { message: 'Device Name is required' }),
});

type AuthorizaDeviceFormProps = {
  code: string;
};

export default function AuthorizaDeviceForm({
  code,
}: AuthorizaDeviceFormProps) {
  const { data, error, isLoading, isError } =
    api.device.fetchDeviceInfo.useQuery({
      code: code,
    });

  const authorizeDevice = api.device.authorizeDevice.useMutation();

  const handleSubmit = async (
    value: IHandleSubmit<z.infer<typeof FormSchema>>,
  ) => {
    try {
      await authorizeDevice.mutateAsync({
        device_name: value.data.device_name,
        device_id: data!.id,
      });
    } catch (error) {
      toast.error('Failed to authorize device');
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-2 overflow-hidden">
        <div className="animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error" dismissible>
        <AlertTitle>Error</AlertTitle>
        <AlertContent>{JSON.stringify(error)}</AlertContent>
      </Alert>
    );
  }

  return (
    <FormBuilder
      enableFormRegisterToParent
      formLabel="Device Authorization"
      formKey="deviceAuthroization"
      formSchema={FormSchema}
      defaultValues={data}
      handleSubmit={handleSubmit}
      fields={[
        {
          id: 'device_name',
          formType: 'input',
          name: 'device_name',
          label: 'Device Name',
          description: 'Device Name',
          placeholder: '',
          fieldClassName: '',
          fieldStyle: {},
          required: true,
        },
      ]}
    />
  );
}
