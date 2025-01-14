"use client";

import { ChevronDownIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TabMenu from "~/components/application-layout/common/TabMenu";
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

type InnerTabItemsProps = {
  tabs: any[];
  pathname?: string;
};

let SEARCH_BAR_WIDTH = 0;

const InnerTabItems = ({ tabs, pathname }: InnerTabItemsProps) => {
  const winWidth = useWindowSize().width;
  const { open } = useSidebar();
  const [isWindowLoaded, setIsWindowLoaded] = useState(false);
  let sidebar_width = remToPx(open ? 16 : 5);
  const size = useScreenType();
  if (size === "xs" || size === "sm" || size === "md") {
    SEARCH_BAR_WIDTH = 0;
    sidebar_width = 0;
  }

  useEffect(() => {
    const handleLoad = () => setIsWindowLoaded(true);

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        setIsWindowLoaded(true);
      } else {
        window.addEventListener("load", handleLoad);
      }
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);


  const newItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - 57;
    const showItem = max_width / 106;

    return tabs.slice(0, Math.floor(showItem));
  }, [winWidth, tabs, sidebar_width]);

  const dropdownItems = useMemo(() => {
    if (!winWidth) return tabs;
    const max_width = winWidth - sidebar_width - SEARCH_BAR_WIDTH - 57;
    const showItem = max_width / 106;

    return tabs.slice(Math.floor(showItem));
  }, [sidebar_width, tabs, winWidth]);

  const entity = pathname?.split("/").at(2);
  const checkIfUserRole = (entity: string) =>
    entity === "user_role" ? true : false;
  return (
    <nav
      aria-label="Tabs"
      className={cn("scrollbar-hide flex justify-between gap-x-2 border-b min-h-[2.3rem] mt-[-4px]")}
    >
      <div className="flex items-center">
        {newItems.map((tab) => {

          const isGrid = tab.name === "Grid";

          return <div
            key={checkIfUserRole(tab.name) ? "role" : tab.name}
            className={cn(`group relative flex items-center  h-[32px]`, `${isGrid ? 'pl-0' : 'pl-[8px]'} `)}
          >
            <a
              data-test-id={entity + "-apptab-" + checkIfUserRole(tab.name) ? "role" : tab.name.split(" ").join("-").toLowerCase()}
              href={tab.href}
              aria-current={tab.current ? "page" : undefined}
              className={cn(
                tab.current ? "text-primary" : "text-default-foreground/60",
                "whitespace-nowrap  text-sm font-medium",
                "flex items-center space-x-2",
                "hover:border-t-primary hover:text-primary",
                `${isGrid ? 'px-[8px]': 'pr-0'}`
              )}
            >
              {formatTabName(checkIfUserRole(tab.name) ? "role" : tab.name)}
              <span className="absolute right-0 h-[50%] w-[1px] bg-default/20"></span>
            </a>
            <TabMenu
              current={tab.href.match(pathname) ? true : false}
              href={tab.href}
              tabs={newItems}
              name={checkIfUserRole(tab.name) ? "role" : tab.name}
            />
          </div>
        })}
      </div>
      {dropdownItems.length > 0 && isWindowLoaded && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary"
            data-test-id={"apptab-ddn-btn"}
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            {dropdownItems.map((tab) => (
              <DropdownMenuItem
                key={checkIfUserRole(tab.name) ? "role" : tab.name}
                className="group relative flex items-center p-2 py-3"
              >
                <a
                  data-test-id={"apptab-" + checkIfUserRole(tab.name) ? "role" : tab.name.split(" ").join("-").toLowerCase()}
                  href={tab.href}
                  aria-current={tab.current ? "page" : undefined}
                  className={cn(
                    tab.current ? "text-primary" : "text-gray-500",
                    "whitespace-nowrap px-4 pr-1 text-sm font-medium",
                    "flex items-center space-x-2",
                    "hover:border-t-primary hover:text-primary",
                  )}
                >
                  {formatTabName(checkIfUserRole(tab.name) ? "role" : tab.name)}
                </a>
                <div className="absolute right-0 h-[50%] w-[1px] bg-gray-300 dark:bg-gray-600 md:hidden" />
                <TabMenu
                  current={tab.href.match(pathname) ? true : false}
                  href={tab.href}
                  tabs={dropdownItems}
                  name={checkIfUserRole(tab.name) ? "role" : tab.name}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
};

export default InnerTabItems;
