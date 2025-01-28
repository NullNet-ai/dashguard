"use client";

import { EllipsisVertical, FileX, FileX2, StarIcon } from "lucide-react";
import {
  closeAllInnerClassTabs,
  closeInnerClassTab,
  closeOtherInnerClassTabs,
} from "~/components/platform/Tab/Actions/InnerTabActions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

const TabMenu = ({
  current,
  href,
  tabs,
  name,
}: {
  current: boolean;
  href: string;
  tabs: any;
  name: string;
}) => {
  if (name === "Grid") return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm opacity-0 group-hover:opacity-100">
          <EllipsisVertical
            className={`h-4 w-4 font-semibold text-default/60`}
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className="relative flex gap-2"
          onClick={() => {
            closeInnerClassTab({
              pathname: href,
              current,
              tabs,
            });
          }}
        >
          <FileX className={`h-4 w-4 text-default/60`} aria-hidden="true" />
          <span>Close Tab</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() => {
            closeOtherInnerClassTabs({
              pathname: href,
              current,
              tabs,
            });
          }}
        >
          <FileX2 className={`h-4 w-4 text-default/60`} aria-hidden="true" />
          <span>Close Other Tabs</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() => {
            closeAllInnerClassTabs({
              pathname: href,
              current,
              tabs,
            });
          }}
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
};

export default TabMenu;
