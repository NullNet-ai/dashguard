'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { useToast } from '~/context/ToastProvider'
import { api } from '~/trpc/react'

import CustomSetupDetails from '../_custom/SetupDetails'
import { type IFormProps } from '../types'

export default function SetupDetails({ params, defaultValues }: IFormProps) {
  const form = useForm()
  const toast = useToast()
  const createOrgAccount = api.device.createOrganizationAccount.useMutation()
  const [orgAccount, setOrgAccount] = useState<Record<string, string> | null>()

  const handleCreateOrgAccount = async () => {
    try {
      const res = (await createOrgAccount.mutateAsync({
        id: params.id,
      })) as Record<string, string> | null

      if (!!res && Object.keys(res).length) {
        toast.success(`${res?.message}`)
      }
      setOrgAccount(res)
      return res
    }
    catch (error) {
      toast.error('Failed to create Organization Account')
    }
  }

  useEffect(() => {
    void handleCreateOrgAccount()
  }, [params.id])

  const handleSave = async () => {
    form.setValue('app_secret', '', {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    })
  }

  const is_from_record = params.shell_type === 'record'

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'lg:grid-cols-1 grid-cols-1',
      }}
      customRender={(form: UseFormReturn<Record<string, any>, any, undefined>) => (
        <CustomSetupDetails
          form={form}
          isFromRecord={is_from_record}
          orgAccount={orgAccount}
          params={params}
        />
      )}
      buttonConfig={{
        hideLockButton: true,
      }}
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      fields={[]}
      formKey="setup_details"
      formLabel="Setup"
      formProps={params}
      formSchema={z.object({})}
      handleSubmit={handleSave}
      myParent={params.shell_type}
    />
  )
}
