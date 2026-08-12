"use client";

import { EllipsisVertical } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getDefaultMenuOptionConfig } from "../../constants";
import RecursiveMenuItem from "./RecursiveMenuItem";
import useScreenType from '~/hooks/use-screen-type';
import { RecordMenuOptionContext } from '~/components/RecordMenuOptionProvider/RecordMenuOptionsProvider';
import { usePathname } from 'next/navigation'
import { testIDFormatter } from '~/utils/formatter'
import { ChevronDownIcon, ChevronUpIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { StatusPoint } from '~/components/ui/StatusPoint';
import { cn } from '~/lib/utils';
import { useEventEmitter } from '~/context/EventEmitterProvider';

export interface IMemoizedRecordData {
  entityName?: string;
  status: string;
  recordId: string;
}

interface IMenuOptionConfig {
  label: string;
  onClick: (recordId: string, entityName: string) => void;
}

interface IDefaultSummaryMenuOptionsProps {
  title?: string;
  memoizedRecordData: IMemoizedRecordData;
  menuOptionConfig?: IMenuOptionConfig[] 
  status?: string;
}

export default function DefaultSummaryMenuOptions({
  title,
  memoizedRecordData,
  menuOptionConfig,
  status
}: IDefaultSummaryMenuOptionsProps) {
  const { recordId, entityName } = memoizedRecordData;
  const path =  usePathname()
  const eventEmitter = useEventEmitter();
  const [, , path1, path2] = path.split('/')
  const screenType = useScreenType()
  const isMobile = screenType === "md" || screenType === "sm" || screenType === "xs";
  const { menu_items } = useContext(RecordMenuOptionContext)
  const [isOpen, setIsOpen] = useState(false);
  
  const memoizedMenuOptionConfig = useMemo(() => {
    return [
      ...getDefaultMenuOptionConfig(memoizedRecordData, eventEmitter),
      ...(menuOptionConfig || []),
      ...(menu_items || []),
    ];
  }, [menuOptionConfig, menu_items, memoizedRecordData]) as IMenuOptionConfig[];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild data-test-id={`${testIDFormatter(`${path1}-${path2}-change-rcrd-state`)}`}>
        <div className="flex justify-center w-full">
          <div className={cn(
            "flex items-center cursor-pointer max-w-12", 
            { 
              'text-primary': isOpen,
              'text-[#828fa1]': !isOpen,
            }
          )}>
            <div className="relative flex items-center gap-2 px-1 z-50 py-1.5 text-left text-sm">
              <ClipboardDocumentListIcon className={`size-6`} aria-hidden="true" />
              <span className='absolute top-[15%] right-[15%]'>
                <StatusPoint style={{ width: '6px', height: '6px' }} variant={status === "Archived" ? "secondary" : "success"} />
              </span>
            </div>
            {isOpen ? (
              <ChevronUpIcon className="size-3" strokeWidth={2.5} />
            ) : (
              <ChevronDownIcon className="size-3" strokeWidth={2.5} />
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align={!isMobile ? 'center' : 'end'} className='mt-1 min-w-20 z-[1000]'>
        {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
        <RecursiveMenuItem
          recordId={recordId}
          entityName={entityName!}
          menuOptionConfig={memoizedMenuOptionConfig}
          isMobile={isMobile}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}