import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from 'react-hook-form';
import { type IField } from '../../types';
import { FormControl, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { OTPInput } from '~/components/ui/otp-input';
import React from 'react';

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  formKey: string;
}

export default function FormOtpInput({
  fieldConfig,
  formRenderProps,
  formKey,
  form,
}: IProps) {
  const isDisabled = fieldConfig.disabled ?? form?.formState.disabled;

  const handleChange = React.useCallback((value: string) => {
      form.setValue(fieldConfig.name, value);
  }, []);

  const handleComplete = React.useCallback((value: string) => {
    form.setValue(fieldConfig.name, value);
    if(fieldConfig.otpInputConfig?.onComplete) {
      fieldConfig.otpInputConfig.onComplete(value);
    }
  }, [form, fieldConfig]);

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <>
          <OTPInput
            disabled={isDisabled}
            value={formRenderProps.field.value}
            onChange={handleChange}
            onComplete={handleComplete}
            {...fieldConfig.otpInputConfig}
          />
        </>
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}
