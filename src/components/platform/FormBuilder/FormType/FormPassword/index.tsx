'use client';

import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Slider } from '~/components/ui/slider';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { testIDFormatter } from '~/utils/formatter';

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
  const { 
    showPasswordStrengthBar = false, 
    hasComplexValidation = false,
    showPasswordGenerator = false 
  } = fieldConfig;

  const isDisabled = fieldConfig.isCustomFormField
    ? fieldConfig?.disabled || fieldConfig?.readonly
    : formRenderProps?.field?.disabled;
  const isReadonly = fieldConfig?.readonly;
  const fieldNameTestId = testIDFormatter(fieldConfig.name);
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

  // Password generator state
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const isPasswordDirty = !!getNestedValue({
    record: form?.formState?.dirtyFields,
    path: fieldConfig.id,
  });

  const showPasswordStrengthBarAndValidations =
  !isDisabled && isPasswordDirty && formRenderProps?.field?.value;
  
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$^()_+\-=\\[\]{}:'",.?<>/]/.test(password),
    };
  };

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

  // Function to generate password
  const generatePassword = () => {
    // Check if at least one character type is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSpecialChars) {
      toast.error("Please select at least one option");
      return;
    }
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSpecialChars) charset += '!@#$^()_+-=[]{}:\'".?<>/';
    
    let generatedPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    
    // Update form field with generated password
    formRenderProps.field.onChange(generatedPassword);
    
    // Close the generator popover
    setIsGeneratorOpen(false);
    
    toast.success("A new password has been created");
  };
  
  // Function to copy password to clipboard
  const copyPasswordToClipboard = () => {
    if (formRenderProps?.field?.value) {
      // Use a more reliable method for clipboard copying
      try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = String(formRenderProps.field.value);
        
        // Make the textarea out of viewport
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        // Execute copy command
        const successful = document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(textarea);
        
        if (successful) {
          toast.success("Password copied to clipboard");
        } else {
          // Fall back to the Clipboard API if execCommand fails
          navigator.clipboard.writeText(String(formRenderProps.field.value))
            .then(() => {
              toast.success("Password copied to clipboard");
            })
            .catch(() => {
              toast.error("Could not copy password to clipboard");
            });
        }
      } catch (err) {
        toast.error("Could not copy password to clipboard");
      }
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
        data-test-id={`${formKey}-label-${fieldNameTestId}`}
        required={fieldConfig?.required}
        htmlFor={`${formKey}-input-${fieldNameTestId}`}
      >
        {fieldConfig?.label}
      </FormLabel>

      {/* Password Input Field */}
      <FormControl>
        <div className="group relative transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
          <Input
            id={`${formKey}-input-${fieldNameTestId}`}
            data-test-id={`${formKey}-input-${fieldNameTestId}`}
            type={showPassword ? 'text' : 'password'}
            {...formRenderProps.field}
            hasError={!!formRenderProps.fieldState.error}
            Icon={icon}
            iconPlacement="left"
            placeholder={fieldConfig?.placeholder}
            readOnly={(isDisabled || fieldConfig?.readonly) ?? false}
            defaultValue={value}
            disabled={fieldConfig.disabled}
            aria-invalid={!!formRenderProps.fieldState.error}
            aria-describedby={
              formRenderProps.fieldState.error
                ? `${formKey}-error-message-${fieldNameTestId}`
                : undefined
            }
            className="pr-24 transition-all duration-200"
          />
          
          {/* Password Generator and Copy Buttons */}
          <div className="absolute right-0 top-0 flex h-full items-center">
            {/* Copy Password Button */}
            {formRenderProps?.field?.value && showPasswordGenerator && !isDisabled && !isReadonly && (
              <Button
                className="mr-1 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
                data-test-id={`${formKey}-copy-password-button-${fieldNameTestId}`}
                disabled={isDisabled}
                Icon={ClipboardDocumentIcon}
                size="sm"
                type="button"
                variant="ghost"
                onClick={copyPasswordToClipboard}
                aria-label="Copy password to clipboard"
                title="Copy password to clipboard"
              >
                <span className="sr-only">Copy password</span>
              </Button>
            )}
            
            {/* Password Generator Button - Only show if enabled in config and not disabled/readonly */}
            {showPasswordGenerator && !isDisabled && !isReadonly && (
              <Popover open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className="mr-1 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
                    data-test-id={`${formKey}-generate-password-button-${fieldNameTestId}`}
                    disabled={isDisabled}
                    Icon={ArrowPathIcon}
                    size="sm"
                    type="button"
                    variant="ghost"
                    aria-label="Generate password"
                    title="Generate password"
                    aria-expanded={isGeneratorOpen}
                    aria-controls={`${formKey}-password-generator-content`}
                  >
                    <span className="sr-only">Generate password</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
                  id={`${formKey}-password-generator-content`}
                  role="dialog"
                  aria-label="Password generator options"
                >
                  <div className="space-y-4">
                    <h4 className="font-medium" id={`${formKey}-generator-heading`}>Password Generator</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span id={`${formKey}-length-label`}>Length: {passwordLength}</span>
                      </div>
                      <Slider
                        value={[passwordLength]}
                        min={8}
                        max={32}
                        step={1}
                        onValueChange={(value) => setPasswordLength(value[0] || 16)}
                        aria-labelledby={`${formKey}-length-label`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${formKey}-uppercase`}
                          checked={includeUppercase}
                          onCheckedChange={(checked) => 
                            setIncludeUppercase(checked === true)}
                        />
                        <label htmlFor={`${formKey}-uppercase`} className="text-sm">
                          Uppercase (A-Z)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${formKey}-lowercase`}
                          checked={includeLowercase}
                          onCheckedChange={(checked) => 
                            setIncludeLowercase(checked === true)}
                        />
                        <label htmlFor={`${formKey}-lowercase`} className="text-sm">
                          Lowercase (a-z)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${formKey}-numbers`}
                          checked={includeNumbers}
                          onCheckedChange={(checked) => 
                            setIncludeNumbers(checked === true)}
                        />
                        <label htmlFor={`${formKey}-numbers`} className="text-sm">
                          Numbers (0-9)
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${formKey}-special`}
                          checked={includeSpecialChars}
                          onCheckedChange={(checked) => 
                            setIncludeSpecialChars(checked === true)}
                        />
                        <label htmlFor={`${formKey}-special`} className="text-sm">
                          Special Characters (!@#$...)
                        </label>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                      onClick={generatePassword}
                      data-test-id={`${formKey}-confirm-generate-password-button-${fieldNameTestId}`}
                    >
                      Generate Password
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            {/* Show/Hide Password Button - Only show if not disabled/readonly */}
            {!isDisabled && !isReadonly && (
              <Button
                className="mr-4 py-2 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
                data-test-id={`${formKey}-show-password-button-${fieldNameTestId}`}
                disabled={isDisabled}
                Icon={showPassword ? EyeIcon : EyeSlashIcon}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </FormControl>

      {showPasswordStrengthBar && showPasswordStrengthBarAndValidations && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuetext={passwordStrength.text}>
            {[1, 2, 3].map((bar) => (
              <div
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
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
        <FormMessage 
          data-test-id={`${formKey}-error-message-${fieldNameTestId}`}
          id={`${formKey}-error-message-${fieldNameTestId}`}
        />
      )}

      {/* Complex Validation Rules (Conditional) */}
      {showPasswordStrengthBarAndValidations &&
        (hasComplexValidation ? (
          <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300" role="list" aria-label="Password requirements">
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
              <div 
                className="flex items-center" 
                key={rule.key} 
                role="listitem"
                aria-label={`${rule.label}: ${passwordValidation[rule.key as keyof typeof passwordValidation] ? 'satisfied' : 'not satisfied'}`}
              >
                {passwordValidation[
                  rule.key as keyof typeof passwordValidation
                ] ? (
                  <CheckIcon className="h-4 w-4 text-green-500 transition-all duration-300" />
                ) : (
                  <XMarkIcon className="h-4 w-4 text-red-500 transition-all duration-300" />
                )}
                <span className="ml-2 text-sm">{rule.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <FormMessage
            data-test-id={`${formKey}-error-message-${fieldNameTestId}`}
            id={`${formKey}-error-message-${fieldNameTestId}`}
            isMultiple={hasComplexValidation}
          />
        ))}
    </FormItem>
  );
}
