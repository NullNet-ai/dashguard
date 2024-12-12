'use client';

import React from "react";
import { cn } from "~/lib/utils";
import {Button} from '@headlessui/react'

type tabType = {
  name: string
    id: string
    current?: boolean
    icon: React.ElementType,
}

type SummaryTabType = {
  tabs: tabType [];
  onTabChanged?: (item:  tabType) => void
}

const SummaryTab = ({ tabs, onTabChanged   }: SummaryTabType) => {

  return (
    <div
      className={cn("flex flex-row ", )}
    >
      {
        tabs?.map((tab) => { 
          const ICON = tab.icon;

          const active = tab.current ? 'border-primary border-b-2' : 'border-transparent border-b-2';
          return (
            <Button key={tab.id} className={cn('group w-1/3 relative flex items-center px-4  justify-center hover:bg-slate-100', active)}
              onClick={() => {
                onTabChanged?.(tab);
              }}
            >
              <div className={cn('whitespace-nowrap  px-1 py-3 text-sm font-medium flex items-center',
                
              )}>
                <ICON aria-hidden="true" className={cn(
                  'h-4 w-4',
                  tab.current ? 'text-primary' : 'text-slate-300'
                )} />
              </div>
            </Button>
          )
        })
      }
    </div>
    
  );
};

export default SummaryTab;
