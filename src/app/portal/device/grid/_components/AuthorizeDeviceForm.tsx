'use client'

import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert'
import { api } from '~/trpc/react'

const FormSchema = z.object({
  device_name: z
    .string({ message: 'Device Name is required' })
    .min(1, { message: 'Device Name is required' }),
})

interface AuthorizaDeviceFormProps {
  code: string
}

export default function AuthorizaDeviceForm({
  code,
}: AuthorizaDeviceFormProps) {
  const { data, error, isLoading, isError }
    = api.device.fetchDeviceInfo.useQuery({
      code,
    })

  const authorizeDevice = api.device.authorizeDevice.useMutation()

  const handleSubmit = async (
    value: IHandleSubmit<z.infer<typeof FormSchema>>,
  ) => {
    try {
      await authorizeDevice.mutateAsync({
        device_name: value.data.device_name,
        // @ts-expect-error - No type yet
        device_id: data!.id,
      })
    }
    catch (error) {
      toast.error('Failed to authorize device')
    }
  }

  if (isLoading) {
    return (
      <div className='relative h-2 overflow-hidden'>
        <div className='animate-slide absolute left-0 top-0 h-[3px] w-full bg-blue-500' />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert dismissible={true} variant="error">
        <AlertTitle>Error</AlertTitle>
        <AlertContent>{JSON.stringify(error)}</AlertContent>
      </Alert>
    )
  }

  return (
    <FormBuilder
      defaultValues={data}
      enableFormRegisterToParent={true}
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
      formKey="deviceAuthroization"
      formLabel="Device Authorization"
      formSchema={FormSchema}
      handleSubmit={handleSubmit}
    />
  )
}
