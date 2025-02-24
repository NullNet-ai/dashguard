'use client'

import { type z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { ExternalUserDetailsSchema } from '~/server/zodSchema/account/externalUserDetails'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast()

  const update = api.record.updateDynamicRecord.useMutation()

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ExternalUserDetailsSchema>>) => {
    try {
      const response = await update.mutateAsync({
        id: params.id,
        entity: 'organization_account',
        data: {
          role_id: data.role,
          email: data.email?.[0]?.email,
          account_id: data.email?.[0]?.email,
        },
      })
      if (response) {
        toast.success('External User details submitted successfully')
        return response
      }
    }
    catch (error) {
      toast.error('Failed to submit External User details')
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent={ true }
      fields={[
        {
          id: 'role',
          formType: 'select',
          name: 'role',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
        {
          id: 'email',
          formType: 'email-input',
          name: 'email',
          label: 'Email',
          required: true,
          placeholder: 'Example: john@example.com',
          disabled: params.shell_type === 'record',
        },
      ]}
      formKey={"UserDetails"}
      formLabel={
        params.shell_type === 'record'
          ? 'Account Details'
          : 'Invite External User'
      }
      formProps={params}
      formSchema={ExternalUserDetailsSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
      selectOptions={selectOptions}
    />
  )
}
