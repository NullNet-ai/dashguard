import React from 'react';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import { CustomFieldProps } from '~/components/platform/FormBuilder/types';

const VariableField = (props: CustomFieldProps) => {
  const {
    form,
    formKey,
    fieldConfig,
    selectOptions = {},
    ...formRenderProps
  } = props;
  console.log('🚀 ~ VariableField ~ props:', props);
  const data_source = form.watch(
    fieldConfig.id === 'subject_variables'
      ? 'subject_data_source'
      : 'content_data_source',
  );
  const entityOptions: any = selectOptions.variables?.find(
    (option: any) => option.value === data_source,
  );
  return (
    <FormSelect
      form={form}
      formKey={formKey}
      fieldConfig={fieldConfig}
      formRenderProps={formRenderProps}
      selectOptions={{
        [fieldConfig.id]: entityOptions?.options,
      }}
    />
  );
};

export default VariableField;
