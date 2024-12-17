'use client'

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
import { useState } from "react";
import { testIDFormatter } from "~/utils/formatter";


interface IProps {
  groups: ISidebarMenu[];
  title?: string;
}

export default function GroupMenu({ groups }: IProps) {
  // State to track favorites for each submenu item
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  // Toggle favorite for a specific submenu item
  const toggleFavorite = (e: React.MouseEvent, itemTitle: string) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    setFavorites((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  const {open} = useSidebar();

  return (
    <SidebarGroup 
      className={`${!open ? 'px-0' : ''}`}

    >
      <Separator className="mb-3" />
      {groups?.map((item, index) => {
        // @ts-expect-error - TS doesn't know about dynamic imports
        const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
        return (
          <SidebarMenu key={index}>
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className={`${!open ? 'w-full flex items-center justify-center flex-col' : ''}`}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="relative flex justify-center  flex-1 overflow-visible"
                    data-test-id={
                      testIDFormatter(`sidebar-grp-menu-${  item.title?.charAt(0).toUpperCase()}${item.title?.slice(1).toLowerCase()}`)
                    }
                  >
                    {item.icon && <ICON className={`h-5 w-5 ${open ? 'mr-2' : ''}`} />}
                    {open ? <span className="font-semibold">{item.title}</span> : null}
                    {!!item?.items?.length && (
                      <ChevronRightIcon className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${!open ? 'absolute -right-4 z-[50]' : ''}`} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
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
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`${subItem?.isActive && "bg-muted text-primary"}`}
                          >
                            <a
                              className={`group/item flex items-center gap-2`}
                              href={subItem.url || "#"}
                              data-test-id={testIDFormatter(`sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-link`)}
                              
                            >
                              {subItem.icon && (
                                <SUB_ICON className={`h-5 w-5 ${open ? 'mr-2' : ''}`} />
                              )}
                              {open && <span className="grow text-nowrap font-semibold">
                                {subItem.title}
                              </span>}
                             <>
                             {open ? (<>
                              {isFavorite ? (
                                <SolidStarIcon
                                  onClick={(e) =>
                                    toggleFavorite(e, subItem.title ?? "")
                                  }
                                  data-test-id={testIDFormatter(`sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-fav-btn`)}
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
                             </>) : null}
                             
                             </>
                            </a>
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
