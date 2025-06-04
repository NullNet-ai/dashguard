'use client'

import React, { useEffect } from 'react'
import { type z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { DeviceBasicDetailsSchema } from '~/server/zodSchema/device/deviceBasicDetails'
import { api } from '~/trpc/react'

import CustomBasicDetails from '../_custom/CustomBasicDetails'
import { type IFormProps } from '../types'

export default function BasicDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  console.log("%c Line:19 🍓 selectOptions", "color:#33a5ff", selectOptions);
  const toast = useToast()
  const [disabledModel, setDisabledModel] = React.useState(false)

  const updateBasicDetails = api.device.updateBasicDetails.useMutation()

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof DeviceBasicDetailsSchema>>) => {
    try {
      console.log("%c Line:32 🍔 data", "color:#465975", {data, params});
      const res = await updateBasicDetails.mutateAsync({
        id: params.id,
        ...data,
      })
      console.log("%c Line:30 🍰 res", "color:#fca650", res);
      if (res.status_code == 200) {
        setDisabledModel(true)
        toast.success('Basic Details submit sucessfully')
      }
      return res
    }
    catch (error) {
      console.log("%c Line:41 🥑 error", "color:#4fff4B", error);
      toast.error('Failed to submit Basic Details')
    }
  }
  useEffect(() => {
    if (defaultValues?.model) {
      setDisabledModel(true)
    }
  }, [defaultValues?.model])

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid-cols-1 lg:grid-cols-1',
      }}
      customRender={(form, options) => {
        return (
          <CustomBasicDetails
            defaultValues={defaultValues}
            disabledModel={disabledModel}
            form={form}
            options={{
              ...options,
              appendFormKey: options?.appendButtonKey || '' }}
            selectOptions={selectOptions}
          />
        )
      }}
      defaultValues={defaultValues}
      enableFormRegisterToParent={true}
      fields={[]}
      formKey="device_basic_details"
      formLabel="Basic Details"
      formProps={params}
      formSchema={DeviceBasicDetailsSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
      selectOptions={selectOptions}
    />
  )
}
