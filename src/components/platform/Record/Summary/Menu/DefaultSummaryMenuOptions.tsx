"use client";

import { EllipsisVertical } from "lucide-react";
import { useContext, useMemo } from "react";
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
}

export default function DefaultSummaryMenuOptions({
  title,
  memoizedRecordData,
  menuOptionConfig,
}: IDefaultSummaryMenuOptionsProps) {
  const { recordId, entityName } = memoizedRecordData;
  const path =  usePathname()
  const [, , path1, path2] = path.split('/')
  const screenType = useScreenType()
  const isMobile = screenType === "md" || screenType === "sm" || screenType === "xs";
  const { menu_items
  } = useContext(RecordMenuOptionContext)
  
  const memoizedMenuOptionConfig = useMemo(() => {
    return [
      ...getDefaultMenuOptionConfig(memoizedRecordData),
      ...(menuOptionConfig || []),
      ...(menu_items || []),
    ];
  }, [menuOptionConfig, menu_items, memoizedRecordData]) as IMenuOptionConfig[];

  return (
    <DropdownMenu
    >
      <DropdownMenuTrigger asChild data-test-id={`${testIDFormatter(`${path1}-${path2}-change-rcrd-state`)}`}>
        <div className="flex items-center gap-2 px-1 z-50 py-1.5 text-left text-sm cursor-pointer">
          <EllipsisVertical className={`h-4 w-4`} aria-hidden="true" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side='bottom' align={!isMobile ? 'center' : 'end'} className='z-[1000]'>
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