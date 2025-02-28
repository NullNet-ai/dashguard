/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { type ReactElement } from 'react'
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from 'react-hook-form'

import { Input } from '~/components/ui/input'
import { type Option } from '~/components/ui/multi-select'

import FormAddress from '../../../FormType/FormAddress'
import FormAlertComponent from '../../../FormType/FormAlert'
import FormCheckbox from '../../../FormType/FormCheckbox'
import FormCurrencyInput from '../../../FormType/FormCurrencyInput'
import FormDatePicker from '../../../FormType/FormDate'
import FormDateRange from '../../../FormType/FormDateRange'
import FormDraggable from '../../../FormType/FormDraggable'
import FormEmailInput from '../../../FormType/FormEmailInput'
import FormFileUpload from '../../../FormType/FormFileUpload'
import FormGroupMultiField from '../../../FormType/FormGroupMultiField'
import FormInput from '../../../FormType/FormInput'
import FormInputGrid from '../../../FormType/FormInputGrid'
import FormTextInputs from '../../../FormType/FormInputs'
import FormLabelValueInput from '../../../FormType/FormLabelValueInput'
import FormMultiField from '../../../FormType/FormMultiField'
import FormMultiSelect from '../../../FormType/FormMultiSelect'
import FormNumberInput from '../../../FormType/FormNumberInput'
import FormPassword from '../../../FormType/FormPassword'
import FormPhoneInput from '../../../FormType/FormPhoneInput'
import FormRadio from '../../../FormType/FormRadio'
import FormRichTextEditor from '../../../FormType/FormRichTextEditor'
import FormSelect from '../../../FormType/FormSelect'
import FormSeparator from '../../../FormType/FormSeparator'
import FormSlider from '../../../FormType/FormSlider'
import FormSmartDate from '../../../FormType/FormSmartDate'
import FormSpaceComponent from '../../../FormType/FormSpace'
import FormSwitch from '../../../FormType/FormSwitch'
import FormTextArea from '../../../FormType/FormTextArea'
import FormTimePicker from '../../../FormType/FormTimePicker'
import {
  type ICheckboxOptions,
  type IRadioOptions,
  type ISelectOptions,
  type IField,
  type TFormSchema,
} from '../../../types'
import FormGroupTab from '../../../FormType/FormGroupTab'
import FormCustom from '../../../FormType/FormCustom'
import FormComboBox from '../../../FormType/FormCombobox'

export default function RenderFormType(
  fieldConfig: IField,
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>
    fieldState: ControllerFieldState
  },
  form: UseFormReturn<Record<string, any>, any, undefined>,
  formKey: string,
  formSchema: TFormSchema,
  subConfig: {
    selectOptions?: Record<string, ISelectOptions[]>
    multiSelectOptions?: Record<string, Option[]>
    radioOptions?: Record<string, IRadioOptions[]>
    checkboxOptions?: Record<string, ICheckboxOptions[]>
    currencyInputOptions?: Record<string, Option[]>
    multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>
  },
): ReactElement {
  switch (fieldConfig?.formType) {
    case 'input':
      return (
        <FormInput
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'input-grid':
      return (
        <FormInputGrid
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'textarea':
      return (
        <FormTextArea
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'select':
      return (
        <FormSelect
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
          selectOptions={subConfig?.selectOptions}
        />
      )
    case 'multi-select':
      return (
        <FormMultiSelect
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
          multiSelectOnSearch={subConfig?.multiSelectOnSearch}
          multiselectOptions={subConfig?.multiSelectOptions}
        />
      )
    case 'radio':
      return (
        <FormRadio
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
          radioOptions={subConfig?.radioOptions}
        />
      )
    case 'checkbox':
      return (
        <FormCheckbox
          checkboxOptions={subConfig?.checkboxOptions}
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'date':
      return (
        <FormDatePicker
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'date-range':
      return (
        <FormDateRange
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'smart-date':
      return (
        <FormSmartDate
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'phone-input':
      return (
        <FormPhoneInput
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'email-input':
      return (
        <FormEmailInput
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'inputs':
      return (
        <FormTextInputs
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'input-label-value':
      return (
        <FormLabelValueInput
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'address-input':
      return (
        <FormAddress
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'file':
      return (
        <FormFileUpload
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'slider':
      return (
        <FormSlider
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'rich-text-editor':
      return (
        <FormRichTextEditor
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'number-input':
      return (
        <FormNumberInput
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'password':
      return (
        <FormPassword
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
          formSchema={formSchema}
        />
      )
    case 'currency-input':
      return (
        <FormCurrencyInput
          currencyInputOptions={subConfig?.currencyInputOptions}
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'time-picker':
      return (
        <FormTimePicker
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'draggable':
      return (
        <FormDraggable
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'multi-field':
      return (
        <FormMultiField
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'switch':
      return (
        <FormSwitch
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'group-multi-field':
      return (
        <FormGroupMultiField
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
        />
      )
    case 'group-tab':
      return (
        <FormGroupTab
          fieldConfig={fieldConfig}
          form={form}
          formKey={formKey}
          formRenderProps={formRenderProps}
          formSchema={formSchema}
        />
      )
    case 'alert':
      return <FormAlertComponent fieldConfig={fieldConfig} />
    case 'space':
      return <FormSpaceComponent />
    case 'separator':
      return <FormSeparator fieldConfig={fieldConfig} />
    case 'combobox':
      return <FormComboBox fieldConfig={fieldConfig} form={form} formKey={formKey} formRenderProps={formRenderProps} />
    case 'custom-field':
      return (
        <FormCustom fieldConfig={fieldConfig} form={form} formKey={formKey} formRenderProps={formRenderProps} />
      )
    default:
      return <Input />
  }
}
