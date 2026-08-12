import { CARD_TYPES } from './constants';
import { CardType } from './types';

/**
 * Detects the card type based on the card number
 * @param cardNumber - The card number to analyze
 * @returns The detected card type or null if no match
 */
export const detectCardType = (cardNumber: string): CardType | null => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  for (const cardType of CARD_TYPES) {
    if (cardType.pattern.test(cleanNumber)) {
      return cardType;
    }
  }
  
  return null;
};

/**
 * Validates if a card number is valid based on CARD_TYPES patterns and lengths
 * @param cardNumber - The card number to validate
 * @returns Object with validation result and detected card type
 */
export const validateCardNumber = (cardNumber: string): {
  isValid: boolean;
  cardType: CardType | null;
  errors: string[];
} => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  const errors: string[] = [];
  
  // Check if card number is empty
  if (!cleanNumber) {
    errors.push('Card number is required');
    return { isValid: false, cardType: null, errors };
  }
  
  // Check if card number contains only digits
  if (!/^\d+$/.test(cleanNumber)) {
    errors.push('Card number must contain only digits');
    return { isValid: false, cardType: null, errors };
  }
  
  // Detect card type
  const cardType = detectCardType(cleanNumber);
  
  if (!cardType) {
    errors.push('Invalid card number format');
    return { isValid: false, cardType: null, errors };
  }
  
  // Check if length is valid for the detected card type
  if (!cardType.lengths.includes(cleanNumber.length)) {
    errors.push(`Invalid ${cardType.name} card number length. Expected ${cardType.lengths.join(' or ')} digits`);
    return { isValid: false, cardType, errors };
  }
  
  // Luhn algorithm validation
  if (!isValidLuhn(cleanNumber)) {
    errors.push('Invalid card number (failed checksum validation)');
    return { isValid: false, cardType, errors };
  }
  
  return { isValid: true, cardType, errors: [] };
};

/**
 * Validates CVC based on the card type
 * @param cvc - The CVC to validate
 * @param cardType - The detected card type
 * @returns Validation result
 */
export const validateCVC = (cvc: string, cardType: CardType | null): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!cvc) {
    errors.push('CVC is required');
    return { isValid: false, errors };
  }
  
  if (!/^\d+$/.test(cvc)) {
    errors.push('CVC must contain only digits');
    return { isValid: false, errors };
  }
  
  if (cardType) {
    if (cvc.length !== cardType.code.size) {
      errors.push(`${cardType.code.name} must be ${cardType.code.size} digits`);
      return { isValid: false, errors };
    }
  } else {
    // Generic validation if card type is unknown
    if (cvc.length < 3 || cvc.length > 4) {
      errors.push('CVC must be 3 or 4 digits');
      return { isValid: false, errors };
    }
  }
  
  return { isValid: true, errors: [] };
};

/**
 * Luhn algorithm implementation for card number validation
 * @param cardNumber - The card number to validate
 * @returns True if valid according to Luhn algorithm
 */
function isValidLuhn(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates expiry date
 * @param month - Expiry month (MM)
 * @param year - Expiry year (YY or YYYY)
 * @returns Validation result
 */
export const validateExpiryDate = (month: string, year: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!month || !year) {
    errors.push('Expiry date is required');
    return { isValid: false, errors };
  }
  
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) {
    errors.push('Invalid expiry month');
    return { isValid: false, errors };
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Handle 2-digit year format
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  
  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    errors.push('Card has expired');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [] };
};