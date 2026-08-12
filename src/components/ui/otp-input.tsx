'use client';

import * as React from 'react';
import { cn } from '~/lib/utils';
import { Input } from './input';

export interface OTPInputProps {
  /** OTP length (4, 6, 8 digits) */
  length?: number;
  /** Variation type */
  variant?: 'single' | 'multiple';
  /** Current OTP value */
  value?: string;
  /** Callback when OTP value changes */
  onChange?: (value: string) => void;
  /** Callback when OTP is complete */
  onComplete?: (value: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Custom placeholder for single field */
  placeholder?: string;
  /** Show character counter for single field */
  showCounter?: boolean;
  /** Custom placeholder character for multiple fields */
  placeholderChar?: string;
  /** Optional verify button */
  showVerifyButton?: boolean;
  /** Verify button callback */
  onVerify?: () => void;
  /** Custom error message */
  customErrorMessage?: string;
  /** Container className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading text */
  loadingText?: string;
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      variant = 'multiple',
      value = '',
      onChange,
      onComplete,
      isLoading = false,
      error,
      success,
      autoFocus = true,
      placeholder = `Enter ${length}-digit code`,
      showCounter = true,
      placeholderChar = '_',
      showVerifyButton = false,
      onVerify,
      customErrorMessage,
      className,
      disabled = false,
      loadingText,
      ...props
    },
    ref
  ) => {
    const [otp, setOtp] = React.useState<string>(value);
    const [activeIndex, setActiveIndex] = React.useState<number>(0);
    const [localError, setLocalError] = React.useState<string>('');
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const singleInputRef = React.useRef<HTMLInputElement>(null);

    // Initialize refs array for multiple variant
    React.useEffect(() => {
      if (variant === 'multiple') {
        inputRefs.current = Array(length).fill(null);
      }
    }, [length, variant]);

    // Auto focus on mount
    React.useEffect(() => {
      if (autoFocus && !disabled && !isLoading) {
        if (variant === 'single' && singleInputRef.current) {
          singleInputRef.current.focus();
        } else if (variant === 'multiple' && inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      }
    }, [autoFocus, disabled, isLoading, variant]);

    // Sync external value changes
    React.useEffect(() => {
      if (value !== otp) {
        setOtp(value);
        if (variant === 'multiple') {
          // Focus on the next empty field or last field
          const nextIndex = Math.min(value.length, length - 1);
          setActiveIndex(nextIndex);
          setTimeout(() => {
            inputRefs.current[nextIndex]?.focus();
          }, 0);
        }
      }
    }, [value, otp, variant, length]);

    // Clear local error when user starts typing
    React.useEffect(() => {
      if (otp.length > 0 && (localError || error)) {
        setLocalError('');
      }
    }, [otp, localError, error]);

    // Check if OTP is complete and call onComplete
    React.useEffect(() => {
      if (otp.length === length && onComplete) {
        onComplete(otp);
      }
    }, [otp, length, onComplete]);

    const handleChange = React.useCallback(
      (newValue: string) => {
        // Filter only numeric characters
        const numericValue = newValue.replace(/[^0-9]/g, '');
        
        // Enforce length limit
        const limitedValue = numericValue.slice(0, length);
        
        setOtp(limitedValue);
        onChange?.(limitedValue);
      },
      [length, onChange]
    );

    const handleSingleFieldChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e.target.value);
      },
      [handleChange]
    );

    const handleMultipleFieldChange = React.useCallback(
      (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        
        // If multiple digits are typed rapidly, only keep the last digit
        const digit = newValue.slice(-1);
        
        if (digit && !/^[0-9]$/.test(digit)) {
          return; // Only allow numeric input
        }

        const newOtp = otp.split('');
        newOtp[index] = digit;
        
        // Remove empty trailing elements
        while (newOtp.length > 0 && newOtp[newOtp.length - 1] === '') {
          newOtp.pop();
        }
        
        const newOtpString = newOtp.join('');
        setOtp(newOtpString);
        onChange?.(newOtpString);

        // Auto-navigation: move to next field if digit entered
        if (digit && index < length - 1) {
          setActiveIndex(index + 1);
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus();
          }, 0);
        }
      },
      [otp, length, onChange]
    );

    const handleKeyDown = React.useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Keyboard navigation for both single and multiple variants
        if (e.key === 'ArrowLeft' && index > 0) {
          e.preventDefault();
          setActiveIndex(index - 1);
          inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
          e.preventDefault();
          setActiveIndex(index + 1);
          inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          setActiveIndex(0);
          inputRefs.current[0]?.focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          const lastIndex = length - 1;
          setActiveIndex(lastIndex);
          inputRefs.current[lastIndex]?.focus();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          const currentValue = otp[index] || '';
          
          if (currentValue) {
            // Clear current field
            const newOtp = otp.split('');
            newOtp[index] = '';
            const newOtpString = newOtp.join('').replace(/\s+$/, ''); // Remove trailing spaces
            setOtp(newOtpString);
            onChange?.(newOtpString);
          } else if (index > 0) {
            // Move to previous field and clear it
            const newOtp = otp.split('');
            newOtp[index - 1] = '';
            const newOtpString = newOtp.join('').replace(/\s+$/, '');
            setOtp(newOtpString);
            onChange?.(newOtpString);
            setActiveIndex(index - 1);
            setTimeout(() => {
              inputRefs.current[index - 1]?.focus();
            }, 0);
          }
        }
      },
      [otp, length, onChange]
    );

    const handlePaste = React.useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        
        // Filter only numeric characters
        const numericData = pastedData.replace(/[^0-9]/g, '');
        const limitedData = numericData.slice(0, length);
        
        setOtp(limitedData);
        onChange?.(limitedData);

        // Focus on the last filled field for both variants
        const lastIndex = Math.min(limitedData.length - 1, length - 1);
        if (lastIndex >= 0) {
          setActiveIndex(lastIndex);
          setTimeout(() => {
            inputRefs.current[lastIndex]?.focus();
          }, 0);
        } else if (limitedData.length === 0) {
          // If no data pasted, focus first field
          setActiveIndex(0);
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 0);
        }
      },
      [length, onChange, variant]
    );

    const handleFocus = React.useCallback(
      (index: number) => {
        setActiveIndex(index);
      },
      []
    );

    const handleContainerClick = React.useCallback(() => {
      // Find the last empty field or first field if all are empty
      let targetIndex = 0;
      for (let i = 0; i < length; i++) {
        if (!otp[i]) {
          targetIndex = i;
          break;
        }
        if (i === length - 1) {
          // All fields are filled, focus the last one
          targetIndex = length - 1;
        }
      }
      
      // Focus the target input
      if (inputRefs.current[targetIndex]) {
        inputRefs.current[targetIndex]?.focus();
        setActiveIndex(targetIndex);
      }
    }, [otp, length]);

    const renderSingleField = () => {
      return (
        <div className="space-y-4">
          <div 
            className={cn(
              "flex gap-2 px-2  rounded-md border cursor-text relative",
              "border-gray-300 bg-white",
              "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
              error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500",
              success && "border-green-500 focus-within:border-green-500 focus-within:ring-green-500",
              (disabled || isLoading) && "bg-secondary cursor-not-allowed"
            )}
            onClick={handleContainerClick}
          >
            {Array.from({ length }, (_, index) => {
              const value = otp[index] || '';
              return (
                <div key={index} className="relative">
                  <Input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={value}
                    onChange={(e) => handleMultipleFieldChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => handleFocus(index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    disabled={disabled || isLoading}
                    containerClassName="w-6 h-10"
                    className={cn(
                      "w-6 h-10 text-center text-lg font-mono !outline-none !ring-transparent !border-0 !focus:border-0 !focus:ring-0 !focus:outline-none bg-transparent",
                      "focus:bg-transparent"
                    )}
                    autoComplete="one-time-code"
                  />
                  {/* Placeholder circle for empty fields */}
                  {!value && index >= otp.length && (
                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full -translate-y-1/2 -translate-x-1/2" />
                  )}
             
                </div>
              );
            })}
            {showCounter && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {otp.length}/{length}
              </div>
            )}
          </div>
        </div>
      );
    };

    const renderMultipleFields = () => {
      return (
        <div className="flex gap-2 justify-start">
          {Array.from({ length }, (_, index) => {
            const value = otp[index] || '';
            return (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={value}
                onChange={(e) => handleMultipleFieldChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleFocus(index)}
                onPaste={handlePaste}
                placeholder={placeholderChar}
                maxLength={1}
                disabled={disabled || isLoading}
                containerClassName="w-12 h-12"
                className={cn(
                  "w-12 h-12 text-center text-lg font-mono",
                  // "focus:ring-2 focus:ring-blue-500",
                  error && "border-red-500 focus:border-red-500",
                  success && "border-green-500 focus:border-green-500",
                  // activeIndex === index && "ring-2 ring-blue-500"
                )}
                autoComplete="one-time-code"
              />
            );
          })}
        </div>
      );
    };

    const displayError = error || localError || customErrorMessage;

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {variant === 'single' ? renderSingleField() : renderMultipleFields()}
        
        {/* Error Message */}
        {displayError && (
          <div className="text-sm text-red-600 text-center">
            {displayError}
          </div>
        )}
        
        {/* Success Message */}
        {success && !displayError && (
          <div className="text-sm text-green-600 text-center">
            {success}
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-sm text-muted-foreground text-center">
            {loadingText ? loadingText : 'Verifying...'}
          </div>
        )}
        
        {/* Verify Button */}
        {showVerifyButton && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onVerify}
              disabled={disabled || isLoading || otp.length !== length}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-md",
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        )}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export { OTPInput };