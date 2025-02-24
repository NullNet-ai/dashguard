import React from 'react'
import { type Control, type FieldValues, type UseFormReturn } from 'react-hook-form'

import { FormField } from '~/components/ui/form'

interface SignUpFormFieldProps {
  form: UseFormReturn<FieldValues, any, undefined>
  control: Control<FieldValues, any>
  formKey: string
  fields: {
    FormComponent: React.FC<any>
    name: string
    id: string
    label: string
    placeholder: string
    type: string
    required?: boolean
    showPasswordStrengthBar?: boolean
    hasComplexValidation?: boolean,
    readOnly?: boolean
  }[]
}

const SignUpFormField: React.FC<SignUpFormFieldProps> = ({
  form,
  control,
  formKey,
  fields,
}) => {
  return fields.map((field) => {
    const {
      FormComponent,
      name,
      id,
      label,
      placeholder,
      type,
      required,
      showPasswordStrengthBar,
      hasComplexValidation,
    } = field
    return (
      <FormField
        control={ control }
        key={ id }
        name={ name }
        render={ (formProps) => {
          return (
            <FormComponent
              fieldConfig={ {
                id,
                name,
                label,
                placeholder,
                type,
                ...(showPasswordStrengthBar && {
                  showPasswordStrengthBar: true,
                }),
                ...(hasComplexValidation && {
                  hasComplexValidation: true,
                }),
                ...(required && {
                  required: true,
                }),
              } }
              form={ form }
              formKey={ formKey }
              formRenderProps={ formProps }
            />
          )
        } }
      />
    )
  })
}

export default SignUpFormField
