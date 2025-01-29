"use client";

import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical, FileX, FileX2, StarIcon } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { closeAllClassTabs, closeClassTab, closeOtherClassTabs } from "./Actions/MainTabActions";
import { IPropsTabList } from "./type";

interface IProps extends IPropsTabList {
  test?: any;
}

export default function CloseTab({ current, href, name }: IProps) {
  // const pathname = usePathname()
  if(name === "dashboard") return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 w-[18px] !ml-0 px-1 py-1.5 pl-[2px] text-left pr-[2px] text-sm opacity-0 group-hover:opacity-100">
          <EllipsisVertical
            className={`h-4 w-4 font-semibold text-default/60`}
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => {
            closeClassTab({
              pathname: href,
              current,
            });
          }}
          className="flex gap-2"
        >
          <FileX className={`h-4 w-4 text-default/60`} aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex gap-2"
          onClick={() => {
            closeOtherClassTabs({
              pathname: href,
              current,
            });
          }}
        >
          <FileX2 className={`h-4 w-4 text-default/60`} aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex gap-2"
          onClick={() => closeAllClassTabs()}
        >
          <FileX className={`h-4 w-4 text-default/60`} aria-hidden="true" />
          <span>Close All Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2">
          <StarIcon className="h-4 w-4" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}