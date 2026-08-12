import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ControllerFieldState, ControllerRenderProps, type UseFormReturn } from 'react-hook-form';
import { CreditCardData, CardType, CreditCardField } from './types';
import { detectCardType, validateCardNumber, validateExpiry, processInputValue } from './utils';
import { IField } from '~/components/platform/FormBuilder/types';
import { isEmpty } from 'lodash';

const initialFormData: CreditCardData = {
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvc: '',
  cardName: '',
  nickname: '',
  zipcode: '',
  address: '',
  cardType: '',
};

type UseCreditCardFormProps = {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  fieldConfig: IField;
    formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  formKey: string;
}

export const useCreditCardForm = ({ form, fieldConfig, formRenderProps, formKey }: UseCreditCardFormProps) => {

  const [formData, setFormData] = useState<CreditCardData>(initialFormData);
  const [errors, setErrors] = useState<Partial<CreditCardData>>({});
  const [focused, setFocused] = useState<string>('');

  const changed = useRef<any>(false);

  // Memoized card type detection
  const cardType = useMemo((): CardType | null => {
    return detectCardType(formData.cardNumber);
  }, [formData.cardNumber]);

  // Handle input changes with useCallback for performance
  const handleInputChange = useCallback((field: CreditCardField, value: string) => {
    const processedValue = processInputValue(field, value, cardType);

    setFormData((prev) => ({ ...prev, [field]: processedValue, 
      cardType: cardType?.name || '',
     } ));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    changed.current = true;
  
  }, [cardType, errors]);

  // Sync form data with external form when available
  useEffect(() => {
   
    if (changed.current) {
      validateForm();
       if (form) {
        form.setValue(fieldConfig.name, formData);
        formRenderProps.field.onBlur();
        form.trigger(fieldConfig.name);
        formRenderProps.field.onChange(formData);
      }
    } else {
      if(!isEmpty(form.getValues(fieldConfig.name))) {
        setFormData(form.getValues(fieldConfig.name));
      }
        
    }
  }, [form, formData]);

  // Sync errors with external form when available
  useEffect(() => {
    if (form && Object.keys(errors).length > 0) {
      // Set individual field errors
      Object.entries(errors).forEach(([field, error]) => {
        if (error) {
          form.setError(fieldConfig.name, {
            type: 'manual',
            message: error,
          });
        }
      });
    } else {
      form.setError(fieldConfig.name, {
        type: 'manual',
        message: '',
      });
    }
  }, [form, errors]);

  // Handle expiry date change with special logic
  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/[^0-9]/g, '');

    // Get current display value to detect backspace/deletion
    const currentDisplayValue =
      formData.expiryMonth +
      (formData.expiryYear
        ? '/' + formData.expiryYear
        : formData.expiryMonth.length === 2
          ? '/'
          : '');
    const isDeleting = rawValue.length < currentDisplayValue.length;

    // Handle deletion - remove one character at a time from display
    if (isDeleting) {
      if (currentDisplayValue.endsWith('/')) {
        // If current display ends with '/', remove the slash (go back to just month)
        setFormData((prev) => ({
          ...prev,
          expiryMonth: (prev.expiryMonth || '').slice(0, -1),
          expiryYear: '',
        }));
      } else if (formData.expiryYear) {
        // Remove last digit from year
        const newYear = formData.expiryYear.slice(0, -1);
        setFormData((prev) => ({
          ...prev,
          expiryYear: newYear,
        }));
      } else if (formData.expiryMonth) {
        // Remove last digit from month
        const newMonth = formData.expiryMonth.slice(0, -1);
        setFormData((prev) => ({
          ...prev,
          expiryMonth: newMonth,
        }));
      }
      return;
    }

    // Handle normal input based on digits only
    if (digitsOnly.length === 0) {
      setFormData((prev) => ({ ...prev, expiryMonth: '', expiryYear: '' }));
    } else if (digitsOnly.length === 1) {
      // First digit of month
      setFormData((prev) => ({
        ...prev,
        expiryMonth: digitsOnly,
        expiryYear: '',
      }));
    } else if (digitsOnly.length === 2) {
      // Two digits for month - validate range 01-12
      const month = digitsOnly;
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        setFormData((prev) => ({
          ...prev,
          expiryMonth: month,
          expiryYear: '',
        }));
      } else {
        // Invalid month, keep only first digit
        setFormData((prev) => ({
          ...prev,
          expiryMonth: digitsOnly.slice(0, 1),
          expiryYear: '',
        }));
      }
    } else if (digitsOnly.length === 3) {
      // Month + first digit of year
      const month = digitsOnly.slice(0, 2);
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        const yearDigit = digitsOnly.slice(2, 3);
        setFormData((prev) => ({
          ...prev,
          expiryMonth: month,
          expiryYear: yearDigit,
        }));
      }
    } else if (digitsOnly.length >= 4) {
      // Month + two digits of year
      const month = digitsOnly.slice(0, 2);
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        const year = digitsOnly.slice(2, 4);
        setFormData((prev) => ({
          ...prev,
          expiryMonth: month,
          expiryYear: year,
        }));
      }
    }

    // Clear error when user starts typing
    if (errors.expiryMonth) {
      setErrors((prev) => ({ ...prev, expiryMonth: '' }));
    }

    validateForm()

  }, [formData.expiryMonth, formData.expiryYear, errors.expiryMonth]);

  // Validate form with useCallback
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CreditCardData> = {};

    // Card number validation
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry validation
    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Expiry date is required';
    } else if (!validateExpiry(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiryMonth = 'Invalid or expired date';
    }

    // CVC validation
    if (!formData.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (cardType && formData.cvc.length !== cardType.code.size) {
      newErrors.cvc = `CVC must be ${cardType.code.size} digits`;
    }

    // Card name validation
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    // Zipcode validation
    if (!formData.zipcode) {
      newErrors.zipcode = 'Zipcode is required';
    } else if (formData.zipcode.length !== 5) {
      newErrors.zipcode = 'Zipcode must be 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, cardType]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle successful submission
      if (form) {
        // Update the external form with credit card data
        form.setValue('creditCard', formData);
        form.trigger('creditCard');
      }
    }
  }, [validateForm, formData, form]);

  // Handle focus changes
  const handleFocus = useCallback((field: string) => {
    setFocused(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused('');
  }, []);

  return {
    formData,
    errors,
    focused,
    cardType,
    handleInputChange,
    handleExpiryDateChange,
    handleSubmit,
    handleFocus,
    handleBlur,
    validateForm,
  };
};