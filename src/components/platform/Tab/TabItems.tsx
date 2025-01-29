"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import useScreenType from "~/hooks/use-screen-type";
import { remToPx } from "~/utils/fetcher";
import { cn, formatAndCapitalize } from "~/lib/utils";
import Item from "./Item";
import { type IPropsTabList } from "./type";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";

const SEARCH_BAR_WIDTH = 0; // Fixed search bar width for layout calculations.
const ITEM_WIDTH = 140; // Approximate width of a tab item in pixels.
const OFFSET_WIDTH = 57; // Fixed offset for other UI elements.

type TabItemsProps = {
  items: IPropsTabList[];
  children?: React.ReactNode;
};

const TabItems = ({ items }: TabItemsProps) => {
  const winWidth = useWindowSize().width;
  const { open } = useSidebar();
  const screenSize = useScreenType();
  const pathname = usePathname();
  const [, , entity] = pathname?.split("/");
  const insertTabs = api.tab.insertMainTabs.useMutation();
  const [newTabList, setNewTabList] = useState<IPropsTabList[]>(items);
  // Adjust sidebar width based on whether it is open or closed.
  const sidebarWidth = useMemo(
    () =>
      screenSize === "xs" || screenSize === "sm" || screenSize === "md"
        ? 0
        : remToPx(open ? 16 : 5),
    [screenSize, open],
  );

  const [visibleItems, dropdownItems] = useMemo(() => {
    if (!winWidth) return [newTabList, []];

    const maxAvailableWidth =
      winWidth - sidebarWidth - SEARCH_BAR_WIDTH - OFFSET_WIDTH;
    const maxVisibleItems = Math.floor(maxAvailableWidth / ITEM_WIDTH);

    return [
      newTabList.slice(0, maxVisibleItems),
      newTabList.slice(maxVisibleItems),
    ];
  }, [newTabList, winWidth, sidebarWidth]);

  const isUserRole = (entity: string) => entity === "user_role";

  // Insert new tabs into the tab list.
  const insertMainTabs = () => {
    const found = newTabList.find((tab) => {
      const [, , entityName] = tab.href.split("/");
      return entityName === entity;
    });

    if (found) {
      return;
    }
    const newTab = [
      ...newTabList,
      {
        name: entity,
        href: pathname,
        current: true,
      },
    ]?.map((item) => {
      return {
        ...item,
        current: item.href === pathname,
      };
    }) as IPropsTabList[];
    setNewTabList(newTab);
    insertTabs.mutateAsync(newTab);
    // Drop by into database
  };

  useEffect(() => {
    insertMainTabs();
  }, [entity]);

  return (
    <Fragment>
      <div className="flex w-full flex-1">
        {visibleItems.map((tab) => (
          <Item tab={tab} key={isUserRole(tab.name) ? "role" : tab.name} />
        ))}
      </div>
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-auto flex items-center space-x-1 bg-muted px-4 text-sm font-medium text-gray-500 hover:text-primary"
            aria-label="More tabs"
            data-test-id="mainTabDropdownButton"
          >
            <ChevronDownIcon
              className="h-6 w-6 text-muted-foreground group-hover:text-primary"
              aria-hidden="true"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {dropdownItems.map((tab) => (
              <DropdownMenuItem
                key={isUserRole(tab.name) ? "role" : tab.name}
                className="group relative flex items-center p-2 py-3"
              >
                <Link
                  data-test-id={
                    "mntab-" +
                    (isUserRole(tab.name)
                      ? "role"
                      : tab.name.replace(/\s+/g, ""))
                  }
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
                  {formatAndCapitalize(
                    isUserRole(tab.name) ? "role" : tab.name,
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Fragment>
  );
};

export default TabItems;
