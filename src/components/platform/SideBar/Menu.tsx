import { Fragment, useState } from "react";
import { type ISidebarMenu } from "./type";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "~/components/ui/sidebar";
import * as _ICON from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
import { testIDFormatter } from "~/utils/formatter";
import useScreenType from "~/hooks/use-screen-type";
interface IProps {
  item: ISidebarMenu;
}

export default function Menu({ item }: IProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const {open} = useSidebar();
  const stype = useScreenType();

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
                      data-test-id={testIDFormatter(`sidebar-menu-${item.title}`)}
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
                            data-test-id={testIDFormatter(`sidebar-menu-${item.title ?? "default"}-${subItem.title}`)}
                            
                          >
                            <a
                              href={subItem.url || "#"}
                              data-test-id={testIDFormatter(`sidebar-menu-${item.title ?? "default"}-${subItem.title}-link`)}
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
                className={`flex items-center  gap-2 group/item ${isActive && "bg-muted text-primary"} ${open ? '' : 'justify-center bg-transparent'} `}
                data-test-id={testIDFormatter(`sdnavmenu-itm-${item.title}`)}
                >
                <SidebarMenuButton tooltip={item.title}
                  data-test-id={testIDFormatter(`sdnavmenu-itm-${item.title}-btn`)}
                >
                  <ICON className="mr-2 h-5 w-5" />
                  {open || (stype ==='sm' ||   stype ==='md' ||stype ==='xs')
                  ?     <span className="font-semibold">{item.title}</span> : null}
                  <> {!open ? (
                      isFavorite ? (
                        <SolidStarIcon
                          onClick={toggleFavorite}
                          data-test-id={testIDFormatter(`sdnavmenu-itm-${item.title}-fav-btn`)}
                          className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                        />
                      ) : (
                        <StarIcon
                          onClick={toggleFavorite}
                          data-test-id={testIDFormatter(`sdnavmenu-itm-${item.title}-fav-btn`)}
                          className="ml-auto cursor-pointer text-yellow-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover/item:opacity-100"
                        />
                      )
                  ) : null}
                  
                  </>
                </SidebarMenuButton>
              </a>
            )}
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </Fragment>
  );
}
