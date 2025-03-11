import React, { useEffect } from 'react';
import FormRichTextEditor from '~/components/platform/FormBuilder/FormType/FormRichTextEditor';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import { type CustomFieldProps } from '~/components/platform/FormBuilder/types';

const ContentField = (props: CustomFieldProps) => {
  const { form, formKey, fieldConfig, ...formRenderProps } = props;
  console.log("🚀 ~ ContentField ~ formRenderProps:", formRenderProps)
  const variable = form.watch('content_variables');
  console.log('🚀 ~ Content ~ content_variables:', variable);
  const content = form.getValues('content') ?? ''

  useEffect(() => {
    if(variable) {
      form.setValue('content', `${content}<p class="text-node">{${variable}}</p>`);
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
