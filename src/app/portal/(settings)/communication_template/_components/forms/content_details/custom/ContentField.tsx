import React, { useEffect } from 'react';
import FormRichTextEditor from '~/components/platform/FormBuilder/FormType/FormRichTextEditor';
import FormTextArea from '~/components/platform/FormBuilder/FormType/FormTextArea';
import { type CustomFieldProps } from '~/components/platform/FormBuilder/types';

const ContentField = (props: CustomFieldProps) => {
  const { form, formKey, fieldConfig, ...formRenderProps } = props;
  const variable = form.watch('content_variables');
  const content = form.getValues('content') ?? '';
  const category = props?.formState?.defaultValues?.categories?.[0];
  console.log('🚀 ~ ContentField ~ category:', category);

  useEffect(() => {
    if (variable) {
      if (category === 'SMS') {
        const textarea = document.querySelector(
          `textarea[name="content"]`,
        ) as HTMLTextAreaElement;
        
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          
          const newValue = 
            content.substring(0, start) + 
            `{${variable}}` + 
            content.substring(end);
            
          form.setValue('content', newValue);
          
          // Restore cursor position after the inserted variable
          setTimeout(() => {
            const newPosition = start + variable.length + 2; // +2 for {} brackets
            textarea.focus();
            textarea.setSelectionRange(newPosition, newPosition);
          }, 0);
        }
      }else {
        form.setValue('content', `<p>${content}{${variable}}</p>`);
      }
    }
    form.resetField('content_variables');
  }, [variable, form, content]);

  return category === 'SMS' ? (
    <FormTextArea
      fieldConfig={fieldConfig}
      form={form}
      formKey={formKey}
      formRenderProps={formRenderProps}
    />
  ) : (
    <FormRichTextEditor
      fieldConfig={fieldConfig}
      form={form}
      formKey={formKey}
      formRenderProps={formRenderProps}
    />
  );
};

export default ContentField;
