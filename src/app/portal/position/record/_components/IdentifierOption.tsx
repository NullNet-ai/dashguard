"use client";

import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function Options() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <EllipsisVertical className={`h-4 w-4`} aria-hidden="true" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Position Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Open</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Closed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
