'use client'

import React from 'react'
import { type z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import RoleCategoryDetailsSchema from '~/server/zodSchema/user_role/categoryDetails'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

export default function CategoryDetails(props: IFormProps) {
  const params = props.params
  const defaultValues = props.defaultValues
  const multiSelectOptions = props.multiSelectOptions
  const selectOptions = props.selectOptions
  const toast = useToast()
  const updateCategoryDetails = api.user_role.saveCategoryDetails.useMutation()
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof RoleCategoryDetailsSchema>>) => {
    try {
      alert(JSON.stringify(data))
      const response = await updateCategoryDetails.mutateAsync({
        ...data,
        id: params.id,
      })

      if (response.status_code === 200) {
        toast.success('Basic Details submit successfully')
      }
      return response
    }
    catch {
      toast.error('Failed to submit Category Details')
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent={false}
      fields={[
        {
          id: 'categories',
          formType: 'select',
          name: 'categories',
          label: 'Category',
          required: true,
        },
        {
          id: 'entity',
          formType: 'select',
          name: 'entity',
          label: 'Entity',
          required: true,
        },
      ]}
      formKey="UserRoleCategoryDetails"
      formLabel="Category Details"
      formProps={params}
      formSchema={RoleCategoryDetailsSchema}
      handleSubmit={handleSave}
      multiSelectOptions={multiSelectOptions}
      myParent={params.shell_type}
      selectOptions={selectOptions}

    />
  )
}
