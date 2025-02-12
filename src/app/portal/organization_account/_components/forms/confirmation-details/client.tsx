'use client'

import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
})

export default function ConfirmationDetails({
  params,
  defaultValues,
}: IFormProps) {
  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2))
    }
    catch (error) {
      throw error
    }
  }
  return (
    <FormBuilder
      defaultValues={ defaultValues }
      fields={ [
        {
          id: 'tags',
          formType: 'multi-select',
          name: 'tags',
          label: 'Tags',
        },
      ] }
      formKey="Tags"
      formLabel="Tags"
      formProps={ params }
      formSchema={ FormSchema }
      handleSubmit={ handleSave }
      myParent={ params.shell_type }
    />
  )
}
