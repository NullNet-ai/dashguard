// import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react'

import FormRichTextEditor from '~/components/platform/FormBuilder/FormType/FormRichTextEditor'
import { type CustomFieldProps } from '~/components/platform/FormBuilder/types'

import { GetVariables } from '../actions/getVariables'

const ContentSubjectField = (props: CustomFieldProps) => {
  const { form, formKey, fieldConfig, selectOptions, ...formRenderProps }
    = props
  // const searchParams = useSearchParams();
  // const category =
  //   searchParams.get('category') ||
  //   form.formState.defaultValues?.categories?.[0];
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const [variableOptions, setVariableOptions] = React.useState<any>([])

  const getVariableOptions = async (entity: string) => {
    const variables = await GetVariables({ entity })
    setVariableOptions(variables)
    setSelectedEntity(entity)
  }

  return (
    <FormRichTextEditor
      fieldConfig={{
        ...fieldConfig,
        richTextConfig: {
          plainTextMode: fieldConfig.id === 'subject',
          customDropdowns: [
            {
              id: 'entity_selector',
              buttonLabel: selectedEntity
                ? `Entity: ${selectedEntity}`
                : 'Select Entity',
              searchPlaceholder: 'Find an entity type...',
              emptyMessage: 'No entity types available',
              options: selectOptions?.data_source ?? [],
              isFilterMode: true,
              onSelect: async (option) => {
                await getVariableOptions(option.value)
              },
            },
            {
              id: 'field_selector',
              buttonLabel: 'Select Variables',
              searchPlaceholder: 'Search...',
              emptyMessage: selectedEntity
                ? 'No fields available for this entity'
                : 'Please select an entity type first',
              options: variableOptions ?? [],
              formatInsertedValue: option => `{${selectedEntity}.${option.value}}`,
              disabled: !selectedEntity,
            },
          ],
        },
      }}
      form={form}
      formKey={formKey}
      formRenderProps={formRenderProps}
    />
  )
}

export default ContentSubjectField
