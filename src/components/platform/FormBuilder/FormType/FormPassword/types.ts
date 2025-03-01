import React from 'react'
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from 'react-hook-form'

import { type TFormSchema, type IField } from '../../types'

export interface IProps {
  fieldConfig: IField
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>
    fieldState: ControllerFieldState
  }
  form: UseFormReturn<Record<string, any>, any, undefined>
  icon?: React.ElementType
  value?: string
  formKey: string
  formSchema?: TFormSchema
}

export interface IPasswordStrength {
  level: number
  text: string
}
