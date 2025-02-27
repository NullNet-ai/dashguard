'use client';
import { Button } from '@headlessui/react';

import {
  Ban,
  X,
  LockKeyholeOpen,
  RotateCcw,
  Send,
  LockKeyhole,
} from 'lucide-react';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '~/components/ui/tooltip';

export function AccountCustomRowAction() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => null}>
            <Ban className="h-3 w-3 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="z-[9999]">
          <p>Deactivate Account</p>
        </TooltipContent>
      </Tooltip>

      <Button onClick={() => null}>
        <X className="h-3 w-3 text-destructive" />
      </Button>
      <Button onClick={() => null}>
        <LockKeyholeOpen className="h-3 w-3 text-yellow-500" />
      </Button>
      <Button onClick={() => null}>
        <RotateCcw className="h-3 w-3 text-green-600" />
      </Button>
      <Button onClick={() => null}>
        <Send className="h-3 w-3 text-yellow-500" />
      </Button>
      <Button onClick={() => null}>
        <LockKeyhole className="h-3 w-3 text-yellow-500" />
      </Button>
    </TooltipProvider>
  );
}
