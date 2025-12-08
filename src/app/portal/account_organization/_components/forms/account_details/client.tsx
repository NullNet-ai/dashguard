'use client'

import { type z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { AccountDetailSchema } from '~/server/zodSchema/account/internalUserDetails'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'
import { useFormNavigationStateMachine } from '~/components/platform/FormBuilder/Utils/formNavigation'

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast()
  const updateAccountDetails = api.account.updateAccountDetails.useMutation();
  const { handleFormSubmission } = useFormNavigationStateMachine();

  const handleSave = async ({
    data,
    action_type,
    form,
  }: IHandleSubmit<z.infer<typeof AccountDetailSchema>>) => {
    try {
      // const response = await updateAccountDetails.mutateAsync({
      //   ...data
      // });
      // if (response) {
      //   toast.success('Account details submitted successfully')
      //   return response
      // }

      await handleFormSubmission({
        action_type,
        stateMachine: {
          create: {
            invoke: async (): Promise<{ code: string; data: any }> => {
              const response = await updateAccountDetails.mutateAsync({
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
            toast_message: 'Account details submitted successfully',
          },
          update: {
            invoke: async (): Promise<{ code: string; data: any }> => {
              const response = await updateAccountDetails.mutateAsync({
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
            toast_message: 'Account details submitted successfully',
          },
          wizard: {
            new: {},
            code: {},
          },
          record: true,
        },
      });
    }
    catch (error) {
      toast.error('Failed to submit Account Details')
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent={ true }
      fields={[
        {
          id: 'email',
          formType: 'input',
          name: 'email',
          label: 'Email',
          required: true,
          placeholder: 'Enter your email',
        },
        {
          id: 'role_id',
          formType: 'select',
          name: 'role_id',
          label: 'Role',
          required: true,
          placeholder: 'Example: Admin',
        },
      ]}
      formKey={"account_details"}
      formLabel={"Account Details"}
      formProps={params}
      formSchema={AccountDetailSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
      selectOptions={selectOptions}
    />
  )
}
