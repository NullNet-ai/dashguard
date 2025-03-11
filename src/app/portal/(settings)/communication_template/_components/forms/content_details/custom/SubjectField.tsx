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
        const cursorPosition = input.selectionStart ?? subject.length;
        const newValue = subject.slice(0, cursorPosition) + 
          `{${variable}}` + 
          subject.slice(cursorPosition);
        form.setValue('subject', newValue);
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
