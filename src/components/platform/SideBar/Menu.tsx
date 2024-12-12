import { Fragment, useState } from "react";
import { type ISidebarMenu } from "./type";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "~/components/ui/sidebar";
import * as _ICON from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
interface IProps {
  item: ISidebarMenu;
}

export default function Menu({ item }: IProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    setIsFavorite(!isFavorite);
  };

  const { ChevronRightIcon, ChevronUpDownIcon } = _ICON;
  // @ts-expect-error - TS doesn't know about dynamic imports
  const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
  const { isActive } = item;
  return (
    <Fragment>
      <SidebarMenu className="px-2">
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={item.isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            {item?.items?.length ? (
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <ICON className="mr-2 h-5 w-5" />
                    <span>{item.title}</span>
                    <a
                      href={item.url || "#"}
                      className="flex items-center gap-2"
                      data-test-id={"sidebarMainMenu"+item.title}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </a>
                    {!!item?.items?.length && (
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {!!item?.items?.length && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            data-test-id={`sidebar${item.title ?? "default"}${subItem.title}`}
                          >
                            <a
                              href={subItem.url || "#"}
                              data-test-id={`sidebar${item.title ?? "default"}${subItem.title}`}
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </>
            ) : (
              <a
                href={item.url || "#"}
                className={`flex items-center gap-2 group/item ${isActive && "bg-muted text-primary"}`}
                data-test-id={"sidebarMainMenu"+item.title}
                >
                <SidebarMenuButton tooltip={item.title}>
                  <ICON className="mr-2 h-5 w-5" />
                  <span className="font-semibold">{item.title}</span>
                  {isFavorite ? (
                    <SolidStarIcon
                      onClick={toggleFavorite}
                      className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                    />
                  ) : (
                    <StarIcon
                      onClick={toggleFavorite}
                      className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                    />
                  )}
                </SidebarMenuButton>
              </a>
            )}
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </Fragment>
  );
}
