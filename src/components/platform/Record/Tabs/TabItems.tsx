"use client";

import { ChevronDownIcon } from "lucide-react";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import useScreenType from "~/hooks/use-screen-type";
import { cn, formatTabName } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";

type TabItemProps = {
  tabs: any[];
  pathname: string;
};

const SEARCH_BAR_WIDTH = 0;
let SUMMARY_TAB_WIDTH = 300;

const TabItems = ({ tabs, pathname }: TabItemProps) => {
  const winWidth = useWindowSize().width;
  const { open } = useSidebar();
  let sidebar_width = remToPx(open ? 16 : 5);
  const size = useScreenType();
  const router = useRouter();
  const searchParams = useSearchParams();
  if (size === "xs" || size === "sm" || size === "md") {
    sidebar_width = 0;
    SUMMARY_TAB_WIDTH = 0;
  }

  const newItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - SUMMARY_TAB_WIDTH;
    const showItem = max_width / 125;

    return tabs.slice(0, Math.floor(showItem));
  }, [tabs, winWidth, size, open]);

  const dropdownItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - SUMMARY_TAB_WIDTH;
    const showItem = max_width / 125;

    return tabs.slice(Math.floor(showItem));
  }, [newItems]);

  const entityName = pathname.split("/")[2];
  return (
    <div className="flex items-center justify-between border-b border-slate-300">
      <div className={cn("flex flex-row")}>
        {newItems.map((tab) => {
          return (
            <div key={tab.id} className="group relative flex items-center px-4">
              <a
                data-test-id={
                  entityName +
                  "-rcrdtab-" +
                  tab.name.split(" ").join("-").toLowerCase()
                }
                key={tab.name}
                onClick={() => {
                  router.push(`?current_tab=${tab.id}`);
                }}
                aria-current={
                  searchParams.get("current_tab") === tab.id
                    ? "page"
                    : undefined
                }
                className={cn(
                  searchParams.get("current_tab") === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium",
                  "flex items-center space-x-2",
                )}
              >
                {formatTabName(tab.name)}
              </a>
            </div>
          );
        })}
      </div>
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center space-x-1 bg-muted px-4 py-3 text-sm font-medium text-gray-500 hover:text-primary"
            data-test-id={"rcrdtab-ddn-btn"}
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            {dropdownItems.map((tab) => (
              <DropdownMenuItem
                key={tab.name}
                className="group relative flex items-center p-2 py-3"
              >
                <a
                  data-test-id={
                    entityName +
                    "-rcrdtab-" +
                    tab.name.split(" ").join("-").toLowerCase()
                  }
                  href={tab.href}
                  aria-current={
                    searchParams.get("current_tab") === tab.id
                      ? "page"
                      : undefined
                  }
                  className={cn(
                    searchParams.get("current_tab") === tab.id
                      ? "text-primary"
                      : "text-gray-500",
                    "whitespace-nowrap px-4 text-sm font-medium",
                    "flex items-center space-x-2",
                    "hover:border-t-primary hover:text-primary",
                  )}
                >
                  {formatTabName(tab.name)}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default TabItems;
