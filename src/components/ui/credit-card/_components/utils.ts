import moment from 'moment-timezone';
import { CardType } from './types';
import { CARD_TYPES } from './constants';

// Detect card type based on card number
export const detectCardType = (number: string): CardType | null => {
  if (!number) return null;
  const cleanNumber = number.replace(/\s/g, '');
  return CARD_TYPES.find((type) => type.pattern.test(cleanNumber)) || null;
};

// Format card number with appropriate spacing
export const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\s/g, '').replace(/[^0-9]/g, '');
  const detectedType = detectCardType(cleanValue);

  if (!detectedType) {
    // Default formatting for unknown cards (4-4-4-4)
    return cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  let formatted = '';

  for (let i = 0; i < cleanValue.length; i++) {
    // Add space before adding the digit if this position is in gaps array
    if (detectedType.gaps.includes(i) && i > 0) {
      formatted += ' ';
    }
    formatted += cleanValue[i];
  }

  return formatted;
};

// Validate card number using Luhn algorithm and length validation
export const validateCardNumber = (number: string): boolean => {
  const cleanNumber = number.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanNumber)) return false;

  // Check minimum length (at least 13 digits for most cards)
  if (cleanNumber.length < 13) return false;

  // Detect card type and validate length
  const cardType = detectCardType(cleanNumber);
  if (cardType && !cardType.lengths.includes(cleanNumber.length)) {
    return false;
  }

  // If no card type detected, check against common lengths (13-19 digits)
  if (!cardType && (cleanNumber.length < 13 || cleanNumber.length > 19)) {
    return false;
  }

  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Validate expiry date
export const validateExpiry = (month: string, year: string): boolean => {
  if (!month || !year) return false;

  const currentMoment = moment();
  const currentYear = currentMoment.year();
  const currentMonth = currentMoment.month() + 1; // moment months are 0-indexed

  const expMonth = parseInt(month);
  let expYear = parseInt(year);

  // Convert 2-digit year to 4-digit year
  if (expYear < 100) {
    const currentCentury = Math.floor(currentYear / 100) * 100;
    expYear += currentCentury;
    
    // If the year is more than 50 years in the past, assume it's the next century
    if (expYear < currentYear - 50) {
      expYear += 100;
    }
  }

  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
};

// Process input value based on field type
export const processInputValue = (field: string, value: string, cardType: CardType | null): string => {
  switch (field) {
    case 'cardNumber':
      return formatCardNumber(value);
    case 'expiryMonth':
      return value.replace(/[^0-9]/g, '').slice(0, 2);
    case 'expiryYear':
      return value.replace(/[^0-9]/g, '').slice(0, 4);
    case 'cvc':
      const maxLength = cardType?.code.size || 4;
      return value.replace(/[^0-9]/g, '').slice(0, maxLength);
    case 'cardName':
      return value
        .replace(/[^a-zA-Z\s]/g, '')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    case 'zipcode':
      return value.replace(/[^0-9]/g, '').slice(0, 5);
    default:
      return value;
  }
};

// Format expiry date display
export const formatExpiryDisplay = (month: string, year: string): string => {
  if (!month) return '';
  if (month.length === 1) return month;
  if (month.length === 2 && !year) return `${month}/`;
  if (!year) return month;
  if (year.length === 1) return `${month.padStart(2, '0')}/${year}`;
  return `${month.padStart(2, '0')}/${year}`;
};