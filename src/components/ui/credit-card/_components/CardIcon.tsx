import React from 'react';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { CardType } from './types';

interface CardIconProps {
  cardType: CardType | null;
}

const CardIcon: React.FC<CardIconProps> = ({ cardType }) => {
  const iconClass = 'h-6 rounded-sm bg-gray-100';

  if (!cardType) {
     return (
        <img src="/cards/empty-card.png" alt="Visa" className={iconClass} />
      );
  }
  
  switch (cardType.name) {
    case 'visa':
      return (
        <img src="/cards/visa-card.png" alt="Visa" className={iconClass} />
      );
    case 'mastercard':
      return (
        <img
          src="/cards/master-card.png"
          alt="Mastercard"
          className={iconClass}
        />
      );
    case 'amex':
      return (
        <img
          src="/cards/amex-card.png"
          alt="American Express"
          className={iconClass}
        />
      );
    case 'discover':
      return (
        <img
          src="/cards/discover-card.png"
          alt="Discover"
          className={iconClass}
        />
      );
    case 'jcb':
      return (
        <img src="/cards/jcb-card.png" alt="JCB" className={iconClass} />
      );
    default:
      return <CreditCardIcon className={`${iconClass} text-gray-600`} />;
  }
};

export default CardIcon;