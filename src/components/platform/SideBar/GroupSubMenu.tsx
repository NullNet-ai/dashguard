"use client";

import { type ISidebarMenu } from "./type";
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "~/components/ui/sidebar";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

import * as _ICON from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import { testIDFormatter } from "~/utils/formatter";
import useScreenType from "~/hooks/use-screen-type";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";

interface IProps {
  subItem: ISidebarMenu;
  item: ISidebarMenu;
  index: number;
}

function GroupSubMenu(props: IProps) {
  const { subItem, index, item } = props ?? {};

  const { open, openMobile } = useSidebar();
  const sType = useScreenType();

  const pathname = usePathname();
  const [, , entity, application] = pathname?.split("/");

  const refs = useRef<any[]>([]);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  const SUB_ICON =
    // @ts-expect-error - TS doesn't know about dynamic imports
    _ICON?.[subItem?.icon] ?? ChevronUpDownIcon;

  const formattedTitle = (subItem.title ?? "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  // Determine if this submenu item is favorited
  const isFavorite = favorites[subItem.title ?? ""] || false;

  // Toggle favorite for a specific submenu item
  const toggleFavorite = (e: React.MouseEvent, itemTitle: string) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    setFavorites((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  const isActive = useMemo(() => {
    const [, , entityName] = (subItem?.url || "")?.split("/");
    return entityName === entity;
  }, [entity, application]);

  return (
    <SidebarMenuSubItem
      key={subItem?.title}
      className=""
      ref={(el: any) => (refs.current[index] = el!)}
    >
      <SidebarMenuSubButton
        open={open}
        asChild
        className={`${isActive && "bg-muted text-primary"}`}
      >
        <Link
          className={`group/item flex items-center gap-2`}
          href={subItem?.url || "#"}
          data-test-id={testIDFormatter(
            `sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-link`,
          )}
        >
          {subItem?.icon && (
            <SUB_ICON className={`h-5 w-5 ${open ? "mr-2" : ""}`} />
          )}
          {((open && (sType === "sm" || sType === "md" || sType === "xs")) ||
            openMobile ||
            (open && !openMobile)) && (
            <span className="grow text-nowrap font-semibold">
              {subItem?.title}
            </span>
          )}
          <>
            {open ? (
              <>
                {isFavorite ? (
                  <SolidStarIcon
                    onClick={(e) => toggleFavorite(e, subItem?.title ?? "")}
                    data-test-id={testIDFormatter(
                      `sdnavmenu-sub-menu-itm-${item.title ?? "default"}-${formattedTitle}-fav-btn`,
                    )}
                    className="cursor-pointer !text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                  />
                ) : (
                  <StarIcon
                    onClick={(e) => toggleFavorite(e, subItem?.title ?? "")}
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
}

export default GroupSubMenu;
