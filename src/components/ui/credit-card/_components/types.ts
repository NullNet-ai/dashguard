import { SavedCard } from './save-cards';

export interface CreditCardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardName: string;
  nickname: string;
  zipcode: string;
  address: string;
  cardType: string;
}

export interface CardType {
  name: string;
  pattern: RegExp;
  gaps: number[];
  lengths: number[];
  code: { name: string; size: number };
}

export interface CreditCardProps {
  formData: CreditCardData;
  errors: Partial<CreditCardData>;
  focused: string;
  cardType: CardType | null;
  handleInputChange: (field: CreditCardField, value: string) => void;
  handleExpiryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleFocus: (field: string) => void;
  handleBlur: () => void;
  disabled?: boolean;
  readonly?: boolean;
  buttonLabel?: string;
  savedCards?: SavedCard[];
}

export type CreditCardField = keyof CreditCardData;