"use client";

import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import RecursiveMenuItem from "./RecursiveMenuItem";
import { DEFAULT_MENU_OPTION_CONFIG } from "../../constants";

export default function DefaultSummaryMenuOptions({
  title,
  recordId,
  entityName,
}: {
  recordId: string;
  entityName: string;
  title?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <EllipsisVertical className={`h-4 w-4`} aria-hidden="true" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
        <RecursiveMenuItem recordId={recordId} entityName={entityName} menuOptionConfig={DEFAULT_MENU_OPTION_CONFIG} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}