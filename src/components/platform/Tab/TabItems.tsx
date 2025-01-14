'use client'

import { ChevronDownIcon } from "lucide-react";
import React, { useMemo } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";
import Item from "./Item";
import { type IPropsTabList } from "./type";
import { formatAndCapitalize } from "~/lib/utils";
import useScreenType from "~/hooks/use-screen-type";

let SEARCH_BAR_WIDTH = 0;

type TabItemsProps = { 
    items : IPropsTabList[];
    children ?: React.ReactNode;
}

const TabItems = ({ items } : TabItemsProps) => {
    const winWidth = useWindowSize().width;
    const { open } = useSidebar();
    let sidebar_width = remToPx(open ? 16 : 5);
    const size = useScreenType();
    if(size === "xs" || size === "sm" || size === "md") {  
        SEARCH_BAR_WIDTH = 0;
        sidebar_width = 0;
    }

    const newItems = useMemo(() => {

        if (!winWidth) return items;
        const max_width = winWidth - sidebar_width - SEARCH_BAR_WIDTH - 57;
        const showItem = max_width / 85


        return items.slice(0,  Math.floor(showItem))

    }, [items, winWidth, size]) 


    const dropdownItems = useMemo(() => {
        if (!winWidth) return items;
        const max_width = winWidth - sidebar_width - SEARCH_BAR_WIDTH - 57;
        const showItem = max_width / 140

        return items.slice(Math.floor(showItem))
    } , [newItems])

    const checkIfUserRole = (entity: string) =>
    entity === "user_role" ? true : false;

    return (
        <>
            <div className="w-full flex flex-1">
            {newItems.map((tab) => (
                <Item 
                    tab={tab} 
                    key={checkIfUserRole(tab.name) ? "role" : tab.name} 
                />
            ))}
        </div>
        {dropdownItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary" data-test-id={"mainTabDropdownButton"}>
                <ChevronDownIcon
                  className="h-6 w-6 text-muted-foreground group-hover:text-primary"
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dropdownItems.map((tab) => (
                  <DropdownMenuItem
                    key={checkIfUserRole(tab.name) ? "role" : tab.name}
                    className="group relative flex items-center p-2 py-3"
                  >
                    <a
                      data-test-id={"mntab-" + checkIfUserRole(tab.name) ? "role" : tab.name.split(" ").join("")}
                      href={tab.href}
                      aria-current={tab.current ? "page" : undefined}
                      className={cn(
                        tab.current
                          ? "rounded-t-lg border-primary text-primary"
                          : "text-gray-500",
                        "whitespace-nowrap px-4 pt-2 text-sm font-medium",
                        "flex items-center space-x-2",
                        "hover:border-t-primary hover:text-primary",
                      )}
                    >
                      {formatAndCapitalize(checkIfUserRole(tab.name) ? "role" : tab.name)}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
        
    );
};

export default TabItems;
