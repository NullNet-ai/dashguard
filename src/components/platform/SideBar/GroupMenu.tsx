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
  ChevronDownIcon
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
import GroupSubMenu from "./GroupSubMenu";
import { truncate } from 'lodash';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface IProps {
  groups: ISidebarMenu[];
  title?: string;
  screenType: string;
}

const isImageIcon = (icon?: string) => {
  if (!icon) return false;
  const lower = icon.toLowerCase();
  return (
    lower.startsWith("/") &&
    (lower.endsWith(".png") ||
      lower.endsWith(".svg") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif"))
  );
};

const ImageMaskIcon = ({
  src,
  className,
}: {
  src: string;
  className?: string;
}) => {
  return (
    <span
      aria-hidden={true}
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      className={cn(
        'inline-block bg-current [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]',
        className,
      )}
    />
  );
};

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

  const sType = useScreenType();

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
    <SidebarGroup className="mb-2 px-0">
      <Separator className="mb-2" />
      {groups?.map((item, index) => {
        // @ts-expect-error - TS doesn't know about dynamic imports
        const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
        const iconIsImage = isImageIcon(item?.icon);
        return (
          <SidebarMenu key={index} className={isMobile ? "px-2" : ""}>
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className={cn('group/collapsible', {
                'flex justify-center': !open
              })}
            >
              <SidebarMenuItem
                className={`${!open ? "flex w-full flex-col items-center justify-center" : ""}`}
              >
                <CollapsibleTrigger asChild>
                  {(() => {
                    const maxLength = 20;
                    const shouldShowTooltip = item?.title && item.title.length > maxLength;
                    const displayText = shouldShowTooltip ? truncate(item.title, { length: maxLength }) : item.title;

                    const menuButton = (
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          'relative flex flex-1 justify-start overflow-visible lg:justify-center', {
                            '!w-full justify-center !py-1': !open,
                            '!px-0': isMobile
                          }
                        )}
                        data-test-id={testIDFormatter(
                          `sidebar-grp-menu-${item.title?.charAt(0).toUpperCase()}${item.title?.slice(1).toLowerCase()}`,
                        )}
                      >
                        <div className='relative flex gap-2'>
                          {item.icon && (
                            iconIsImage ? (
                              <ImageMaskIcon
                                src={item.icon ?? ""}
                                className={cn('h-6 w-6 text-slate-400', {
                                  'mr-1': open,
                                  'mr-0': !open,
                                })}
                              />
                            ) : (
                              <ICON className={`!size-6 text-slate-400 ${open ? 'mr-1' : 'mr-0'}`} />
                            )
                          )}
                          {(open &&
                            (sType === "sm" || sType === "md" || sType === "xs")) ||
                          openMobile ||
                          (open && !openMobile) ? (
                            <span className="font-medium text-md leading-6">{displayText}</span>
                          ) : null}
                        </div>
                        {!!item?.items?.length && (
                          <ChevronDownIcon
                            className={cn(
                              `ml-auto text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-180`,
                              ` ${!open && !openMobile ? "absolute -right-1 z-[50]" : "relative"}`,
                            )}
                          />
                        )}
                      </SidebarMenuButton>
                    )

                    return shouldShowTooltip ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            {menuButton}
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : menuButton;
                  })()}
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
