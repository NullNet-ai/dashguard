import React, { useEffect, useMemo } from 'react';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import { CustomFieldProps } from '~/components/platform/FormBuilder/types';
import { GetVariables } from '../actions/getVariables';

const VariableField = (props: CustomFieldProps) => {
  const {
    form,
    formKey,
    fieldConfig,
    selectOptions = {},
    ...formRenderProps
  } = props;
  console.log("🚀 ~ VariableField ~ props:", props)
  const data_source = form.watch(
    fieldConfig.id === 'subject_variables'
      ? 'subject_data_source'
      : 'content_data_source',
  );

  const [variableOptions, setVariableOptions] = React.useState<any>([]);
  
  const getVariableOptions = async (entity: string) => {
    const variables = await GetVariables({entity});
    setVariableOptions(variables);
  };

  useEffect(() => {
    if(data_source) {
      getVariableOptions(data_source);
    }
  }, [data_source])

  return (
    <FormSelect
      form={form}
      formKey={formKey}
      fieldConfig={fieldConfig}
      formRenderProps={formRenderProps}
      selectOptions={{
        [fieldConfig.id]: variableOptions,
      }}
    />
  );
};

export default VariableField;
