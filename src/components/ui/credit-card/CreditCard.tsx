'use client';

import React, { useMemo } from 'react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import {
  CreditCardData,
  CardType,
  CreditCardField,
  CreditCardProps,
} from './_components/types';
import { formatExpiryDisplay } from './_components/utils';
import CardIcon from './_components/CardIcon';
import { cn } from '~/lib/utils';

const CreditCard: React.FC<CreditCardProps> = ({
  formData,
  errors,
  focused,
  cardType,
  handleInputChange,
  handleExpiryDateChange,
  handleSubmit,
  handleFocus,
  handleBlur,
  disabled = false,
  readonly = false,
  buttonLabel = 'Save Card',
}) => {
  // Memoized expiry display value
  const expiryDisplayValue = useMemo(() => {
    return formatExpiryDisplay(formData.expiryMonth, formData.expiryYear);
  }, [formData.expiryMonth, formData.expiryYear]);

  // Memoized max length for card number
  const cardNumberMaxLength = useMemo(() => {
    return cardType?.name === 'amex' ? 17 : 19;
  }, [cardType]);

  // Memoized max length for CVC
  const cvcMaxLength = useMemo(() => {
    return cardType?.code.size || 3;
  }, [cardType]);

  return (
    <div className="max-w-[400px]">
      <div className="space-y-2">
        {/* Card Number Row */}
        <div
          className={cn(
            `flex rounded-md border bg-background`,
            `${!!errors.cardNumber || errors.expiryMonth || errors.cvc ? 'border-destructive' : 'border-slate-300'}`,
          )}
        >
          <div className="w-full flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={(e) =>
                  handleInputChange('cardNumber', e.target.value)
                }
                onFocus={() => handleFocus('cardNumber')}
                onBlur={handleBlur}
                leftAddon={<CardIcon cardType={cardType} />}
                containerClassName=" flex flex-row items-center"
                iconClassName=""
                hasError={!!errors.cardNumber}
                className="!border-none py-3 pl-14 !outline-none !ring-0 focus:!outline-none focus:!ring-0"
                maxLength={cardNumberMaxLength}
                disabled={disabled}
                readOnly={readonly}
              />
            </div>
          </div>

          <div className="w-16">
            <Input
              type="text"
              placeholder="MM/YY"
              value={expiryDisplayValue}
              onChange={handleExpiryDateChange}
              onFocus={() => handleFocus('expiry')}
              onBlur={handleBlur}
              hasError={!!errors.expiryMonth}
              className="!border-none py-3 !outline-none !ring-0 focus:!outline-none focus:!ring-0"
              maxLength={5}
              disabled={disabled}
              readOnly={readonly}
            />
          </div>

          <div className="w-14">
            <Input
              type="text"
              placeholder="CVC"
              value={formData.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value)}
              onFocus={() => handleFocus('cvc')}
              onBlur={handleBlur}
              hasError={!!errors.cvc}
              className="!border-none py-3 !outline-none !ring-0 focus:!outline-none focus:!ring-0"
              maxLength={cvcMaxLength}
              disabled={disabled}
              readOnly={readonly}
            />
          </div>
        </div>
        {(errors.cardNumber || errors.expiryMonth || errors.cvc) && (
          <div className="text-sm text-destructive">
            {errors.cardNumber || errors.expiryMonth || errors.cvc}
          </div>
        )}
        {/* Card Name and Zipcode Row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Card Name"
              value={formData.cardName}
              onChange={(e) => handleInputChange('cardName', e.target.value)}
              onFocus={() => handleFocus('cardName')}
              onBlur={handleBlur}
              hasError={!!errors.cardName}
              className="py-3"
              disabled={disabled}
              readOnly={readonly}
            />
          </div>

          <div className="w-32">
            <Input
              type="text"
              placeholder="Zipcode"
              value={formData.zipcode}
              onChange={(e) => handleInputChange('zipcode', e.target.value)}
              onFocus={() => handleFocus('zipcode')}
              onBlur={handleBlur}
              hasError={!!errors.zipcode}
              className="py-3"
              maxLength={5}
              disabled={disabled}
              readOnly={readonly}
            />
          </div>
        </div>
        {(errors.cardName || errors.zipcode) && (
          <div className="text-sm text-destructive">
            {errors.cardName || errors.zipcode}
          </div>
        )}
        {/* Nickname */}
        <div>
          <Input
            type="text"
            placeholder="Nickname"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            onFocus={() => handleFocus('nickname')}
            onBlur={handleBlur}
            className="py-3"
            disabled={disabled}
            readOnly={readonly}
          />
        </div>

        {/* Address */}
        <div>
          <textarea
            placeholder="Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            onFocus={() => handleFocus('address')}
            onBlur={handleBlur}
            rows={4}
            className="w-full resize-none rounded-md border-slate-300 px-2 text-lg text-slate-700 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-secondary disabled:text-gray-400 sm:text-md/6"
            disabled={disabled}
            readOnly={readonly}
          />
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
