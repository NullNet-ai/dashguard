import React, { useEffect } from 'react';
import FormRichTextEditor from '~/components/platform/FormBuilder/FormType/FormRichTextEditor';
import { type CustomFieldProps } from '~/components/platform/FormBuilder/types';

const ContentField = (props: CustomFieldProps) => {
  const { form, formKey, fieldConfig, ...formRenderProps } = props;
  const variable = form.watch('content_variables');
  const content = form.watch('content') ?? ''

  useEffect(() => {
    if(variable) {
      form.setValue('content', `<p>${content}{${variable}}</p>`);
    }
    form.resetField('content_variables');
  }, [variable, form, content])

  return (
    <FormRichTextEditor
      fieldConfig={fieldConfig}
      form={form}
      formKey={formKey}
      formRenderProps={formRenderProps}
    />
  );
};

export default ContentField;
