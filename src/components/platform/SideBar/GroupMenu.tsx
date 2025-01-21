"use client";
import { type ISidebarMenu } from "./type";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
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
import { useEffect, useRef } from "react";
import { testIDFormatter } from "~/utils/formatter";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import GroupSubMenu from "./GroupSubMenu";

interface IProps {
  groups: ISidebarMenu[];
  title?: string;
}

export default function GroupMenu({ groups }: IProps) {
  const refs = useRef<any[]>([]);
  const sType = useScreenType();
  const { open, openMobile } = useSidebar();

  // Scroll to the active item on load
  useEffect(() => {
    const activeIndex = groups?.reduce((acc, items) => {
      if (items?.items?.length) {
        const activeItem = items.items.findIndex((subItem) => subItem.isActive);
        acc = activeItem;
      }

      return acc;
    }, -1);

    if (activeIndex !== -1 && refs.current[activeIndex]) {
      refs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [groups]);

  return (
    <SidebarGroup className={`${!open ? "px-0" : ""}`}>
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
                className={`${!open ? "flex w-full flex-col items-center justify-center" : ""}`}
              >
                <CollapsibleTrigger asChild>
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
                      <ICON className={`h-5 w-5 ${open ? "mr-2" : ""}`} />
                    )}
                    {(open &&
                      (sType === "sm" || sType === "md" || sType === "xs")) ||
                    openMobile ||
                    (open && !openMobile) ? (
                      <span className="font-semibold">{item.title}</span>
                    ) : null}
                    {!!item?.items?.length && (
                      <ChevronRightIcon
                        className={cn(
                          `ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`,
                          ` ${!open && !openMobile ? "absolute -right-4 z-[50]" : ""}`,
                        )}
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="w-full">
                  <SidebarMenuSub>
                    {item.items?.map((subItem, index) => {
                      return (
                        <GroupSubMenu
                          key={index}
                          index={index}
                          subItem={subItem}
                          item={item}
                        />
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
