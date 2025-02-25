import { Fragment, useContext } from 'react'
import { type Field, type UseFormReturn } from 'react-hook-form'
import { type z } from 'zod'

import { FormField } from '~/components/ui/form'
import { type Option } from '~/components/ui/multi-select'
import { formatFormTestID } from '~/lib/utils'

import { WizardContext } from '../../../../Wizard/Provider'
import FormAddress from '../../../FormType/FormAddress'
import type {
  ICheckboxOptions,
  IRadioOptions,
  ISelectOptions,
  IFilterGridConfig,
  IField,
  TFormSchema,
} from '../../../types'
import FormInputGridWrapper from '../../custom/FormFilter/FormInputGridWrapper'

import RenderFormType from './RenderFormType'
import FormCustom from '../../../FormType/FormCustom'

export default function FormModule({
  fields,
  form,
  subConfig,
  formKey,
  gridConfig,
  onSelectFieldFilterGrid,
  formSchema,
  myParent,
  fieldConfig,
}: {
  fields: IField[]
  form: UseFormReturn<Record<string, any>, any, undefined>
  subConfig?: {
    selectOptions?: Record<string, ISelectOptions[]>
    multiSelectOptions?: Record<string, Option[]>
    radioOptions?: Record<string, IRadioOptions[]>
    checkboxOptions?: Record<string, ICheckboxOptions[]>
    multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>
    currencyInputOptions?: Record<string, Option[]>
  }
  fieldConfig?: Field
  formKey: string
  gridConfig?: IFilterGridConfig
  formSchema: TFormSchema
  onSelectFieldFilterGrid?: (data: z.infer<TFormSchema>) => Promise<void>
  myParent?: 'record' | 'wizard'
}) {
  const { state } = useContext(WizardContext)
  const { entityName } = state ?? {}
  const formattedFormKey = formatFormTestID(
    (entityName ?? 'no-entity')
    + ' '
    + (myParent ?? 'no-parent')
    + ' '
    + formKey,
  )
  return (
    <>
      {fields.map((_field, index) => {
        switch (_field.formType) {
          case 'address-input':
            return (
              <div
                className={_field?.fieldClassName}
                key={_field.id + index}
                style={_field?.fieldStyle}
              >
                <FormAddress
                  fieldConfig={fieldConfig as unknown as IField || _field}
                  form={form}
                  formKey={formattedFormKey}
                />
              </div>
            )
          default:
            return (
              <div
                className={_field?.fieldClassName}
                key={_field.id}
                style={_field?.fieldStyle}
              >
                <FormField
                  control={form.control}
                  disabled={_field.disabled}
                  key={_field.id}
                  name={_field.name}
                  render={formProps => _field.withGridFilter
                    ? (
                      <FormInputGridWrapper
                        fieldConfig={_field!}
                        form={form}
                        formSchema={formSchema}
                        gridConfig={gridConfig!}
                        onSelectFieldFilterGrid={onSelectFieldFilterGrid}
                      >
                        {RenderFormType(
                          _field, formProps, form, formKey, formSchema, {
                          checkboxOptions: subConfig?.checkboxOptions,
                          multiSelectOptions: subConfig?.multiSelectOptions,
                          multiSelectOnSearch: subConfig?.multiSelectOnSearch,
                          radioOptions: subConfig?.radioOptions,
                          selectOptions: subConfig?.selectOptions,
                          currencyInputOptions:
                            subConfig?.currencyInputOptions,
                        },
                        )}
                      </FormInputGridWrapper>
                    )
                    : (
                      RenderFormType(
                        _field, formProps, form, formKey, formSchema, {
                        checkboxOptions: subConfig?.checkboxOptions,
                        multiSelectOptions: subConfig?.multiSelectOptions,
                        multiSelectOnSearch: subConfig?.multiSelectOnSearch,
                        radioOptions: subConfig?.radioOptions,
                        selectOptions: subConfig?.selectOptions,
                        currencyInputOptions: subConfig?.currencyInputOptions,
                      },
                      )
                    )}
                />
              </div>
            )
        }
      })}
    </>
  )
}
