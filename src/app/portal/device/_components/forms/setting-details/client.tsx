'use client'

import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types/global/interfaces'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  is_monitoring_enabled: z.boolean().optional(),
  is_remote_access_enabled: z.boolean().optional(),
})
const SettingDetails = ({ params, defaultValues }: IFormProps) => {
  const updateSetting = api.device.updateDeviceSetting.useMutation()

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateSetting.mutateAsync({
        id: params.id,
        ...data,
      })
      if (res.status_code == 200) {
        toast.success('Settings submitted sucessfully')
      }
      return res
    }
    catch (error) {
      throw error
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent = { true }
      fields={[
        {
          id: 'is_monitoring_enabled',
          formType: 'switch',
          name: 'is_monitoring_enabled',
          label: 'Enable Monitoring',
          placeholder: 'Enable Monitoring',
        },
        {
          id: 'is_remote_access_enabled',
          formType: 'switch',
          name: 'is_remote_access_enabled',
          label: 'Enable Remote Access',
          placeholder: 'Enable Remote Access',
        },
      ]}
      formKey="setting_details"
      formLabel="Setting"
      formProps={params}
      formSchema={FormSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
    />
  )
}

export default SettingDetails
