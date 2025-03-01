'use client'

import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, { message: 'Name is required' }),
})

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast()
  const updateOrg = api.organization.update.useMutation()

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateOrg.mutateAsync({
        id: params.id,
        ...data,
      })

      if (res.status_code == 200) {
        toast.success('Basic Details submit sucessfully')
      }
      return res
    }
    catch (error) {
      toast.error('Failed to submit Basic Details')
      return error
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      fields={[
        {
          id: 'name',
          formType: 'input',
          name: 'name',
          label: 'Name',
          required: true,
        },
      ]}
      formKey="organization_basic_details"
      formLabel="Organization"
      formProps={params}
      formSchema={FormSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
      selectOptions={selectOptions}
    />
  )
}
