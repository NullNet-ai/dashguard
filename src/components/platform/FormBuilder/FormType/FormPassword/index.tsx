'use client';

import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import { type IPasswordStrength, type IProps } from './types';

const getNestedValue = ({
  record,
  path,
}: {
  record: Record<string, any>;
  path: string;
}) => {
  return path.split('.').reduce((acc, key) => acc?.[key], record);
};

export default function FormPassword({
  fieldConfig,
  formRenderProps,
  icon,
  form,
  value,
  formKey,
}: IProps) {
  // Destructure configurable properties with default values
  const { showPasswordStrengthBar = false, hasComplexValidation = false } =
    fieldConfig;

  const isDisabled = fieldConfig.isCustomFormField
    ? fieldConfig?.disabled || fieldConfig?.readonly
    : formRenderProps?.field?.disabled;
  const [showPassword, setShowPassword] = useState(false);

  // State for password validation rules
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // State for password strength
  const [passwordStrength, setPasswordStrength] = useState<IPasswordStrength>({
    level: 0,
    text: 'Too Short',
  });

  const isPasswordDirty = !!getNestedValue({
    record: form?.formState?.dirtyFields,
    path: fieldConfig.id,
  });

  const showPasswordStrengthBarAndValidations =
  !isDisabled && isPasswordDirty && formRenderProps?.field?.value;
  
  // Function to validate password against rules
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$^()_+\-=\\[\]{}:'",.?<>/]/.test(password),
    };
  };

  // Function to calculate password strength
  const getPasswordStrength = (validation: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  }) => {
    const rulesSatisfied = Object.values(validation).filter(Boolean).length;

    switch (rulesSatisfied) {
      case 0:
        return { level: 0, text: 'Too Short' };
      case 1:
      case 2:
        return { level: 1, text: 'Weak' };
      case 3:
      case 4:
        return { level: 2, text: 'Moderate' };
      case 5:
        return { level: 3, text: 'Strong' };
      default:
        return { level: 3, text: 'Strong' };
    }
  };

  // Effect to update validation and strength when password changes
  useEffect(() => {
    if (formRenderProps?.field?.value) {
      const validation = validatePassword(String(formRenderProps.field.value));
      setPasswordValidation(validation);
      setPasswordStrength(getPasswordStrength(validation));
      return;
    }
    // Reset validation and strength if password is empty
    setPasswordValidation({
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
    setPasswordStrength({ level: 0, text: 'Too Short' });
  }, [formRenderProps?.field?.value]);

  return (
    <FormItem>
      {/* Password Input Label */}
      <FormLabel
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
        required={fieldConfig?.required}
      >
        {fieldConfig?.label}
      </FormLabel>

      {/* Password Input Field */}
      <FormControl>
        <div className="group relative">
          <Input
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            type={showPassword ? 'text' : 'password'}
            {...formRenderProps.field}
            hasError={!!formRenderProps.fieldState.error}
            Icon={icon}
            iconPlacement="left"
            placeholder={fieldConfig?.placeholder}
            readOnly={(isDisabled || fieldConfig?.readonly) ?? false}
            defaultValue={value}
            disabled={false}
          />
          {/* Show/Hide Password Button */}
          <Button
            className={`absolute right-0 top-0 mr-4 hidden h-full py-2 hover:bg-transparent ${isDisabled ? '' : 'group-hover:block'}`}
            data-test-id={`${formKey}-show-pwd-btn-${fieldConfig.name}`}
            disabled={isDisabled}
            Icon={showPassword ? EyeIcon : EyeSlashIcon}
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>
      </FormControl>

      {showPasswordStrengthBar && showPasswordStrengthBarAndValidations && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((bar) => (
              <div
                className={`h-2 flex-1 rounded-full ${
                  passwordStrength.level >= bar
                    ? passwordStrength.level === 1
                      ? 'bg-red-500'
                      : passwordStrength.level === 2
                        ? 'bg-orange-500'
                        : passwordStrength.level === 3
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                    : 'bg-gray-200'
                }`}
                key={bar}
              />
            ))}
          </div>
          <div className="me-2 mt-1 flex justify-end text-sm text-gray-600">
            {passwordStrength.text}
          </div>
        </div>
      )}

      {!showPasswordStrengthBarAndValidations && (
        <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
      )}

      {/* Complex Validation Rules (Conditional) */}
      {showPasswordStrengthBarAndValidations &&
        (hasComplexValidation ? (
          <div className="mt-2 space-y-1">
            {[
              { key: 'minLength', label: 'At least 12 characters' },
              {
                key: 'hasLowercase',
                label: 'Contains one lowercase letter (a-z)',
              },
              {
                key: 'hasUppercase',
                label: 'Contains one uppercase letter (A-Z)',
              },
              { key: 'hasNumber', label: 'Contains one number (0-9)' },
              {
                key: 'hasSpecialChar',
                label: 'Contains one special character (except *,%,&,;)',
              },
            ].map((rule) => (
              <div className="flex items-center" key={rule.key}>
                {passwordValidation[
                  rule.key as keyof typeof passwordValidation
                ] ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XMarkIcon className="h-4 w-4 text-red-500" />
                )}
                <span className="ml-2 text-sm">{rule.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <FormMessage
            data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
            isMultiple={hasComplexValidation}
          />
        ))}
    </FormItem>
  );
}
