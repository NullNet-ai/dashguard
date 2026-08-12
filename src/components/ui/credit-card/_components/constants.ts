import { CardType } from './types';

export const CARD_TYPES: CardType[] = [
  {
    name: 'visa',
    pattern: /^4/,
    gaps: [4, 8, 12],
    lengths: [16, 18, 19],
    code: { name: 'CVV', size: 3 },
  },
  {
    name: 'mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: 'CVC', size: 3 },
  },
  {
    name: 'amex',
    pattern: /^3[47]/,
    gaps: [4, 10],
    lengths: [15],
    code: { name: 'CID', size: 4 },
  },
  {
    name: 'discover',
    pattern: /^6(?:011|5)/,
    gaps: [4, 8, 12],
    lengths: [16, 19],
    code: { name: 'CID', size: 3 },
  },
  {
    name: 'diners',
    pattern: /^3[0689]/,
    gaps: [4, 10],
    lengths: [14],
    code: { name: 'CVV', size: 3 },
  },
  {
    name: 'jcb',
    pattern: /^35/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: 'CVV', size: 3 },
  },
];