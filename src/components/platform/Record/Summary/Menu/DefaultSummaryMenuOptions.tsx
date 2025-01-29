"use client";

import { EllipsisVertical } from "lucide-react";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getDefaultMenuOptionConfig } from "../../constants";
import RecursiveMenuItem from "./RecursiveMenuItem";

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
  menuOptionConfig?: IMenuOptionConfig[];
}

export default function DefaultSummaryMenuOptions({
  title,
  memoizedRecordData,
  menuOptionConfig,
}: IDefaultSummaryMenuOptionsProps) {
  const { recordId, entityName } = memoizedRecordData;

  const memoizedMenuOptionConfig = useMemo(() => {
    return [
      ...getDefaultMenuOptionConfig(memoizedRecordData),
      ...(menuOptionConfig || []),
    ];
  }, [menuOptionConfig]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <EllipsisVertical className={`h-4 w-4`} aria-hidden="true" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
        <RecursiveMenuItem
          recordId={recordId}
          entityName={entityName!}
          menuOptionConfig={memoizedMenuOptionConfig}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}