'use client';

import React from "react";
import { cn } from "~/lib/utils";
import { Button } from '@headlessui/react';

type tabType = {
  id: string
  current?: boolean
  icon: React.ElementType,
}

type SummaryTabType = {
  tabs: tabType[];
  onTabChanged?: (item: tabType) => void
}

const SummaryTab = ({ tabs, onTabChanged }: SummaryTabType) => {

  return (
    <div className={cn("flex flex-row ")}>
      {
        tabs?.map((tab) => {
          const ICON = tab.icon;

          const active = tab.current ? 'border-primary border-b-2 text-primary' : 'border-transparent border-b-2 text-gray-400';
          return (
            <Button key={tab.id} className={cn('group relative inline-flex flex-grow items-center px-4 justify-center hover:text-primary', active)}
              onClick={() => {
                onTabChanged?.(tab);
              }}
            >
              <div className={cn('whitespace-nowrap px-1 py-3 text-sm font-medium flex items-center')}>
                <ICON aria-hidden="true" className={cn(
                  'h-4 w-4',
                )} />
              </div>
            </Button>
          )
        })
      }
    </div >
  );
};



export default SummaryTab;
