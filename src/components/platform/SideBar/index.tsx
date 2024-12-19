"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import { type ISideBarProps } from "./type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import GroupMenu from "./GroupMenu";
import { Fragment } from "react";
import Menu from "./Menu";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { TriggerOpenCloseSidebarComponent } from "~/components/application-layout/Header/TriggerComponent";
import { useIsMobile } from "~/hooks/use-mobile";
import * as _ICON from "@heroicons/react/24/outline";
import { Separator } from "~/components/ui/separator";
import useWindowSize from "~/hooks/use-resize";
import { testIDFormatter } from "~/utils/formatter";

export default function AppSideBar(config: ISideBarProps) {
  const {
    headerComponent,
    footerComponent,
    footerMenuConfig,
    headerMenuConfig,
    mainMenuConfig,
  } = config;
  const { ChevronUpDownIcon } = _ICON;

  const apiAuth = api.auth.logout.useMutation();
  const navigate = useRouter();
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();
  const { open } = useSidebar();
  const handleLogout = async () => {
    await apiAuth.mutateAsync().then(() => {
      navigate.push("/login");
    });
  };

  const {width} = useWindowSize();
  
  return (
    <Sidebar collapsible="icon">
      {headerComponent && (
        <SidebarHeader className="group relative">
          {!isMobile && (
            <SidebarTrigger
              Icon={TriggerOpenCloseSidebarComponent}
              className={`absolute right-[-8px] top-10 z-50 flex group-hover:flex ${open ? 'lg:hidden': "lg:flex"}`}
              data-test-id="sdnavmenu-trigger-btn"
            />
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              {/* <DropdownMenu> */}
              {/* <DropdownMenuTrigger asChild> */}
              {/* <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                > */}
              {headerComponent}
              {/* {headerMenuConfig?.length && (
                <ChevronUpDownIcon className="ml-auto size-4" />
              )} */}
              {/* </SidebarMenuButton> */}
              {/* </DropdownMenuTrigger>
                {headerMenuConfig?.length && (
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="top"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      {headerComponent}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {headerMenuConfig?.map((item, index) => {
                      if (item?.separator) {
                        return <DropdownMenuSeparator key={index} />;
                      }
                      // @ts-expect-error - TS doesn't know about dynamic imports
                      const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
                      return (
                        <DropdownMenuItem key={index}>
                          <ICON className="mr-2 h-5 w-5" />
                          {item.title}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                )} */}
              {/* </DropdownMenu> */}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent>
        {mainMenuConfig?.map((item, index) => {
          return (
            <Fragment key={index}>
              {!item?.groups?.length ? (
                <Menu item={item} />
              ) : (
                <>
                  <GroupMenu
                    title={item?.groupTitle || ""}
                    groups={item.groups}
                  />
                </>
              )}

              {item.title === "Activity Log" && <Separator />}
            </Fragment>
          );
        })}
      </SidebarContent>
      {footerComponent && (
        <SidebarFooter className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    data-test-id={"sdnavmenu-ftr-btn"}
                    size={"lg"}
                    className="h-20 w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    {footerComponent}
                    <ChevronUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <footer className="mt-1 grid h-10 w-full place-items-center text-nowrap bg-muted text-[10px] text-muted-foreground/70">
                  {open ? (
                    <span>
                      &copy; All Rights Reserved. {currentYear} DNA Micro
                      <sup className="text-[8px]">TM</sup>
                    </span>
                  ) : (
                    <span>&copy;{currentYear}</span>
                  )}
                </footer>
                <DropdownMenuContent
                  className="z-[100] w-[--radix-dropdown-menu-trigger-width] mx-auto max-w-[90%] md:max-w-full  md:min-w-56 rounded-lg"
                  side={width <= 640 ?"top":"right"}
                  align="end"
                  sideOffset={4}
                >
                  {footerMenuConfig?.map((item, index) => {
                    if (item?.separator) {
                      return <DropdownMenuSeparator key={index} />;
                    }
                    // @ts-expect-error - TS doesn't know about dynamic imports
                    const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon;
                    return (
                      <DropdownMenuItem key={index} data-test-id={testIDFormatter("sdnavmenu-ftr-"+item.title?.split("").join(""))}>
                        <ICON className="mr-2 h-5 w-5" />
                        {item.title}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-test-id={"sdnavmenu-ftr-logout-btn"}
                    className="text-destructive"
                  >
                    <ArrowLeftStartOnRectangleIcon className="mr-2 h-5 w-5 text-destructive" />
                    <b>Log out</b>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
