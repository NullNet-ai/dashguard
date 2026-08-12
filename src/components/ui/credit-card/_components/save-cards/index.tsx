import React from 'react';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Check, MoreHorizontal, MoreVertical, Trash } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

export interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  lastFour: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'expires-soon';
  isPrimary?: boolean;
}

interface SavedCardsProps {
  cards: SavedCard[] | undefined;
  onSetPrimary?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

const getCardIcon = (type: string) => {
  const iconMap = {
    visa: '/cards/visa-card.png',
    mastercard: '/cards/master-card.png',
    amex: '/cards/amex-card.png',
    discover: '/cards/discover-card.png',
  };
  return iconMap[type as keyof typeof iconMap] || '/cards/empty-card.png';
};

const getCardName = (type: string) => {
  const nameMap = {
    visa: 'VISA',
    mastercard: 'MasterCard',
    amex: 'American Express',
    discover: 'Discover',
  };
  return nameMap[type as keyof typeof nameMap] || 'Unknown';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'expired':
      return (
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>
      );
    case 'expires-soon':
      return (
        <Badge
          variant="secondary"
          className="bg-orange-100 text-xs text-orange-700"
        >
          Expires Soon
        </Badge>
      );
    default:
      return null;
  }
};

const SavedCards: React.FC<SavedCardsProps> = ({
  cards,
  onSetPrimary,
  onDeleteCard,
}) => {
  const handleSetPrimary = (cardId: string) => {
    onSetPrimary?.(cardId);
  };

  const handleDeleteCard = (cardId: string) => {
    onDeleteCard?.(cardId);
  };

  return (
    <div className="space-y-3">
      {cards?.map((card) => (
        <Card key={card.id} className="rounded-lg border border-gray-200 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={getCardIcon(card.type)}
                alt={`${getCardName(card.type)} logo`}
                className="h-7 rounded-md border border-slate-100 shadow-sm"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {getCardName(card.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Expires: {card.expiryDate}</span>
                  {getStatusBadge(card.status)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {card.isPrimary && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                >
                  Primary
                </Badge>
              )}
              <span className="font-mono text-sm text-gray-900">
                <span className="text-gray-600">••• </span>
                {card.lastFour}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[50]">
                  {(!card.isPrimary && card.status !== 'expired') && (
                    <DropdownMenuItem
                      onClick={() => handleSetPrimary(card.id)}
                      className="flex cursor-pointer gap-x-2"
                    >
                      <Check className="h-3 w-3 text-primary" />
                      Set Primary
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleDeleteCard(card.id)}
                    className="flex cursor-pointer gap-x-2"
                  >
                    <Trash className="h-3 w-3 text-danger" />
                    Remove Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SavedCards;
