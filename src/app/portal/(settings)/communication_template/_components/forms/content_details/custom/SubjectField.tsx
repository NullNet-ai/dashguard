import React, { useEffect } from 'react';
import FormInput from '~/components/platform/FormBuilder/FormType/FormInput';
import { type CustomFieldProps } from '~/components/platform/FormBuilder/types';

const SubjectField = (props: CustomFieldProps) => {
  const { form, formKey, fieldConfig, ...formRenderProps } = props;
  const variable = form.watch('subject_variables');
  const subject = form.getValues('subject') ?? ''

  useEffect(() => {
    if(variable) {
      const input = document.querySelector(`input[name="subject"]`) as HTMLInputElement;
      if (input) {
        const start = input.selectionStart ?? subject.length;
        const end = input.selectionEnd ?? subject.length;
        
        const newValue = subject.substring(0, start) + 
          `{${variable}}` + 
          subject.substring(end);
        
        form.setValue('subject', newValue);
        
        // Restore cursor position after the inserted variable
        setTimeout(() => {
          const newPosition = start + variable.length + 2; // +2 for {} brackets
          input.focus();
          input.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
    form.resetField('subject_variables')
  }, [variable, form])

  return (
    <FormInput
      form={form}
      formKey={formKey}
      fieldConfig={fieldConfig}
      formRenderProps={formRenderProps}
    />
  );
};

export default SubjectField;
