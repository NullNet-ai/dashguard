"use client";

import { type ISidebarMenu } from "./type";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "~/components/ui/sidebar";
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import * as _ICON from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { testIDFormatter } from "~/utils/formatter";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import Link from "next/link";

interface IProps {
  groups: ISidebarMenu[];
  title?: string;
  screenType: string;
}

export default function GroupMenu({ groups, screenType }: IProps) {
  // State to track favorites for each submenu item

  const isMobile =
    screenType !== "lg" && screenType !== "xl" && screenType !== "2xl";

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const refs = useRef<any[]>([]);
  const hasSelected = groups?.some((group) =>
    group?.items?.some((item) => item.isActive),
  );
  const [openMenu, setOpenMenu] = useState(isMobile ? false : hasSelected);

  const stype = useScreenType();

  // Toggle favorite for a specific submenu item
  const toggleFavorite = (e: React.MouseEvent, itemTitle: string) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    setFavorites((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  const { open, openMobile } = useSidebar();

  // Scroll to the active item on load
  //  useEffect(() => {
  //   const activeIndex = groups?.reduce((acc, items,) => {
  //     if(items?.items?.length) {
  //       const activeItem = items.items.findIndex((subItem) =>
  //         subItem.isActive);
  //      acc = activeItem
  //     }

  //     return acc;

  //   }, -1);

  //   if (activeIndex !== -1 && refs.current[activeIndex]) {
  //     setTimeout(() => {
  //       refs.current[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  //     }, 1000);

  //   }

  // }, [groups ]);

  return (
    <SidebarGroup className={`${!open ? "px-0" : ""}`}>
      <Separator className="my-2" />
      {groups?.map((item, index) => {
        // @ts-expect-error - TS doesn't know about dynamic imports
        const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
        return (
          <SidebarMenu key={index} className={isMobile ? "px-2" : ""}>
            <Collapsible
              open={openMenu}
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className={`${!open ? "flex w-full flex-col items-center justify-center" : ""}`}
              >
                <CollapsibleTrigger
                  onClick={() => {
                    setOpenMenu(!openMenu);
                  }}
                  asChild
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      `relative flex flex-1 justify-start overflow-visible lg:justify-center ${openMobile ? "" : ""}`,
                    )}
                    data-test-id={testIDFormatter(
                      `sidebar-grp-menu-${item.title?.charAt(0).toUpperCase()}${item.title?.slice(1).toLowerCase()}`,
                    )}
                  >
                    {item.icon && (
                      <ICON
                        className={`h-5 w-5 ${open || openMobile ? "mr-2" : ""}`}
                      />
                    )}
                    {(open && !isMobile) ||
                    (openMobile && isMobile) ||
                    (open && !openMobile && !isMobile) ? (
                      <span className="font-semibold">{item.title}</span>
                    ) : null}
                    {!!item?.items?.length && (
                      <ChevronRightIcon
                        className={cn(
                          `ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`,
                          ` ${!open && !openMobile && !isMobile ? "absolute -right-4 z-[50]" : ""}`,
                        )}
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="w-full">
                  <SidebarMenuSub className="p-1 px-2.5">
                    {item.items?.map((subItem, index) => {
                      const SUB_ICON =
                        // @ts-expect-error - TS doesn't know about dynamic imports
                        _ICON?.[subItem?.icon] ?? ChevronUpDownIcon;

                      const formattedTitle = (subItem.title ?? "")
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase(),
                        )
                        .join("");

                      // Determine if this submenu item is favorited
                      const isFavorite =
                        favorites[subItem.title ?? ""] || false;

                      return (
                        <SidebarMenuSubItem
                          key={subItem.title}
                          ref={(el: any) => (refs.current[index] = el!)}
                        >
                          <SidebarMenuSubButton
                            asChild
                            className={`${subItem?.isActive && "bg-muted text-primary"}`}
                            open={open}
                          >
                            <Link
                              className={`group/item flex items-center gap-2 lg:h-[2.4rem]`}
                              href={subItem?.url || "#"}
                              data-test-id={testIDFormatter(
                                `sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-link`,
                              )}
                            >
                              {subItem.icon && (
                                <SUB_ICON
                                  className={`h-5 w-5 ${open ? "mr-2" : ""}`}
                                />
                              )}
                              {((open &&
                                (stype === "sm" ||
                                  stype === "md" ||
                                  stype === "xs")) ||
                                openMobile ||
                                (open && !openMobile)) && (
                                <span className="grow text-nowrap font-semibold">
                                  {subItem.title}
                                </span>
                              )}
                              <>
                                {open ? (
                                  <>
                                    {isFavorite ? (
                                      <SolidStarIcon
                                        onClick={(e) =>
                                          toggleFavorite(e, subItem.title ?? "")
                                        }
                                        data-test-id={testIDFormatter(
                                          `sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-fav-btn`,
                                        )}
                                        className="cursor-pointer !text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                                      />
                                    ) : (
                                      <StarIcon
                                        onClick={(e) =>
                                          toggleFavorite(e, subItem.title ?? "")
                                        }
                                        className="cursor-pointer !text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                                      />
                                    )}
                                  </>
                                ) : null}
                              </>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        );
      })}
    </SidebarGroup>
  );
}
