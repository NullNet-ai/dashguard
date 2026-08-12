'use client';

import { useState, use } from 'react';
import { ulid } from 'ulid';
import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import SavedCards, {
  SavedCard,
} from '~/components/ui/credit-card/_components/save-cards';
import { 
  validateCardNumber, 
  validateCVC, 
  validateExpiryDate,
  detectCardType 
} from '~/components/ui/credit-card/_components/validation';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

const FormSchema = z.object({
  'credit-card': z.object({
    cardNumber: z.string()
      .min(1, 'Card number is required')
      .refine((value: string) => {
        const validation = validateCardNumber(value);
        return validation.isValid;
      }, (value: string) => {
        const validation = validateCardNumber(value);
        return { message: validation.errors[0] || 'Invalid card number' };
      }),
    expiryMonth: z.string()
      .min(2, 'Expiry month is required')
      .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month format (MM)'),
    expiryYear: z.string()
      .min(2, 'Expiry year is required')
      .regex(/^\d{2}$/, 'Invalid year format (YY)'),
    cvc: z.string()
      .min(3, 'CVC is required')
      .max(4, 'CVC cannot be more than 4 digits')
      .regex(/^\d+$/, 'CVC must contain only digits'),
    cardName: z.string().min(5, 'Cardholder name must be at least 5 characters'),
    nickname: z.string().optional(),
    zipcode: z.string().min(5, 'ZIP code must be at least 5 characters'),
    address: z.string().min(1, 'Address is required'),
    cardType: z.string().min(1, 'Card type is required'),
  })
  .superRefine((data, ctx) => {
    // Validate expiry date
    const expiryValidation = validateExpiryDate(data.expiryMonth, data.expiryYear);
    if (!expiryValidation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: expiryValidation.errors[0] || 'Invalid or expired date',
        path: ['expiryMonth'],
      });
    }
    
    // Validate CVC based on detected card type
    const cardType = detectCardType(data.cardNumber);
    const cvcValidation = validateCVC(data.cvc, cardType);
    if (!cvcValidation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: cvcValidation.errors[0] || 'Invalid CVC',
        path: ['cvc'],
      });
    }
  }),
  // 'name': z.string().min(1),
});

export default function FormLabel(props: any) {
  const params = use(props.params) as { shell_type?: "wizard" | "record" };

  const {
    defaultValues
  } = props;

  const toast = useToast();

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: '1123',
      lastFour: '4242',
      expiryDate: '12/26',
      status: 'active',
      isPrimary: true,
      type: 'visa',
    },
    {
      id: '2234',
      lastFour: '5678',
      expiryDate: '03/25',
      status: 'expires-soon',
      isPrimary: false,
      type: 'mastercard',
    },
    {
      id: '3345',
      lastFour: '9012',
      expiryDate: '01/27',
      status: 'active',
      isPrimary: false,
      type: 'discover',
    },
    {
      id: '22234',
      lastFour: '1671',
      expiryDate: '01/21',
      status: 'expired',
      isPrimary: false,
      type: 'amex',
    },
  ]);

  const handleSetPrimary = (cardId: string) => {
    setSavedCards(prevCards => 
      prevCards.map(card => ({
        ...card,
        isPrimary: card.id === cardId
      }))
    );
    toast.success('Primary card updated successfully!');
  };

  const handleDeleteCard = (cardId: string) => {
    setSavedCards(prevCards => prevCards.filter(card => card.id !== cardId));
    toast.success('Card removed successfully!');
  };

  const getCardStatus = (expiryMonth: string, expiryYear: string): 'active' | 'expires-soon' | 'expired' => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const monthNum = parseInt(expiryMonth, 10);
    const yearNum = parseInt(expiryYear, 10);
    
    // Handle 2-digit year format
    const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
    
    // Card is expired if the expiry date is in the past
    if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
      return 'expired';
    }
    
    // Check if card expires within the next 3 months
    const expiryDate = new Date(fullYear, monthNum - 1); // monthNum - 1 because Date months are 0-indexed
    const threeMonthsFromNow = new Date(currentYear, currentMonth - 1 + 3); // Add 3 months to current date
    
    if (expiryDate <= threeMonthsFromNow) {
      return 'expires-soon';
    }
    
    return 'active';
  };

  const handleSave = async ({ data, form }: { data: any, form: any }) => {

    return new Promise<void>((resolve, reject) => {
      try {
        // Detect card type from the card number for consistency
        const detectedCardType = detectCardType(data['credit-card'].cardNumber);
        const cardTypeName = detectedCardType?.name || data['credit-card'].cardType;
        
        const newData = {
          id: ulid(),
          lastFour: data['credit-card'].cardNumber.replace(/\s+/g, '').slice(-4),
          expiryDate:
            data['credit-card'].expiryMonth +
            '/' +
            data['credit-card'].expiryYear,
          status: getCardStatus(data['credit-card'].expiryMonth, data['credit-card'].expiryYear),
          isPrimary: false,
          type: cardTypeName as any,
        };
        
        // Check if card already exists
        const exist = savedCards.find(card => 
          card.lastFour === newData.lastFour && 
          card.type === newData.type
        );
        
        if (exist) {
          toast.error('Card already exists');
          reject(new Error('Card already exists'));
          return;
        }
        
        setSavedCards(prev => [...prev, newData]);
        // i want to clear the form after save
        form.reset();
        form.resetField('credit-card', '');
        form.trigger('credit-card');        
        toast.success('Credit card information saved successfully!');
        resolve();
      } catch (error) {
        console.error('Profile update error', error);
        toast.error('Failed to save credit card. Please try again.');
        reject(new Error('Profile update error'));
      }
    });
  };

  const cardFormat = (cardNumber: string) => {
    return cardNumber
      .replace(/\s+/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  return (
    <>
      <FormBuilder
        customDesign={{
          formClassName: 'grid !grid-cols-1 gap-4',
        }}
        myParent={params.shell_type}
        formProps={params}
        formLabel="Credit Card Form"
        handleSubmit={handleSave}
        formKey="formlabel"
        formSchema={FormSchema}
        // Test with valid card numbers based on CARD_TYPES validation:
        // Visa: 4111111111111111, 4242424242424242
        // Mastercard: 5555555555554444, 5105105105105100
        // Amex: 378282246310005, 371449635398431
        // Discover: 6011111111111117, 6011000990139424
        // defaultValues={{
        //   'saved-cards': savedCards,
        //   'credit-card': {
        //     cardNumber: cardFormat('4242424242424242'), // Valid Visa
        //     expiryMonth: '12',
        //     expiryYear: '26',
        //     cvc: '123',
        //     cardName: 'Juphet Test',
        //     nickname: 'test nickname',
        //     zipcode: '33333',
        //     address: 'test address',
        //     cardType: 'visa',
        //   },
        // }}
        fields={[
          {
            id: 'credit-card',
            formType: 'credit-card',
            name: 'credit-card',
            label: 'Credit Card',
            description: 'Field Description',
            placeholder: '',
            fieldClassName: '',
            onSetPrimary: handleSetPrimary,
            onDeleteCard: handleDeleteCard,
          },
        ]}
        savedCardOptions={savedCards}
      />

      
    </>
  );
}
