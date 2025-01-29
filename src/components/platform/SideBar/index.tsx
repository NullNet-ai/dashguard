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
import * as _ICON from "@heroicons/react/24/outline";
import { Separator } from "~/components/ui/separator";
import useWindowSize from "~/hooks/use-resize";
import { testIDFormatter } from "~/utils/formatter";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import Cookies from "js-cookie";
import useScreenType from "~/hooks/use-screen-type";

export default function AppSideBar(config: ISideBarProps) {
  const {
    headerComponent,
    footerComponent,
    footerMenuConfig,
    className,
    mainMenuConfig,
    screenType,
  } = config;
  const { ChevronUpDownIcon } = _ICON;
  const apiAuth = api.auth.logout.useMutation();
  const navigate = useRouter();
  const currentYear = new Date().getFullYear();
  const { open, openMobile } = useSidebar();
  const handleLogout = async () => {
    await apiAuth.mutateAsync().then(() => {
      navigate.push("/login");
    });
  };

  const { width } = useWindowSize();
  const screen = useScreenType() || screenType;
  const isMobile = screen !== "lg" && screen !== "xl" && screen !== "2xl";

  if (screenType !== screen && screen) {
    Cookies.set("screen-type", `${screen}`, { expires: 7 }); // Expires in 7 days
  }

  return (
    <Sidebar
      collapsible="icon"
      className={className}
      screenType={screen || screenType}
    >
      {headerComponent && (
        <SidebarHeader className="group relative">
          <SidebarTrigger
            Icon={TriggerOpenCloseSidebarComponent}
            className={`absolute right-2 top-10 z-50 flex group-hover:flex ${open || openMobile ? "hidden" : "lg:flex"}`}
            data-test-id="sdnavmenu-trigger-btn"
          />
          <SidebarMenu>
            <SidebarMenuItem>{headerComponent}</SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent>
        {mainMenuConfig?.map((item, index) => {
          return (
            <Fragment key={index}>
              {!item?.groups?.length ? (
                <Menu item={item} screenType={screen || screenType} />
              ) : (
                <>
                  <GroupMenu
                    title={item?.groupTitle || ""}
                    groups={item.groups}
                    screenType={screen || screenType || ""}
                  />
                </>
              )}
              {item?.separator && <Separator className="my-2" />}
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
                  {open ? (
                    <div
                      className={cn(
                        `${open ? "w-full border-b opacity-100" : "h-0 w-0 opacity-0"} `,
                      )}
                    >
                      <SidebarMenuButton
                        data-test-id={"sdnavmenu-ftr-btn"}
                        size={"lg"}
                        className="h-12 w-full p-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        {footerComponent}
                        <ChevronUpDownIcon className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        `cursor-pointer ${!open ? "w-full opacity-100" : "h-0 w-0 opacity-0"}`,
                      )}
                    >
                      {footerComponent}
                    </div>
                  )}
                </DropdownMenuTrigger>
                <Button
                  variant={"ghost"}
                  onClick={handleLogout}
                  data-test-id={"sdnavmenu-ftr-logout-btn"}
                  className={cn(
                    `h-8 w-full text-destructive hover:bg-secondary hover:text-destructive`,
                    `${open && !isMobile ? "justify-start" : "justify-center"}`,
                    `${openMobile ? "justify-start px-2" : ""}`,
                  )}
                >
                  <ArrowLeftStartOnRectangleIcon
                    className={`mr-2 ms-3 h-5 w-5`}
                  />
                  {(open && !isMobile) ||
                  (openMobile && isMobile) ||
                  (open && !openMobile && !isMobile) ? (
                    <p>Logout</p>
                  ) : null}
                </Button>
                <footer className="mt-1 grid h-10 w-full place-items-center text-nowrap bg-muted text-[10px] text-muted-foreground/70">
                  {open && !isMobile ? (
                    <span>
                      &copy; All Rights Reserved. {currentYear} DNA Micro
                      <sup className="text-[8px]">TM</sup>
                    </span>
                  ) : (
                    <span>&copy;{currentYear}</span>
                  )}
                </footer>
                {footerMenuConfig && (
                  <DropdownMenuContent
                    className="z-[100] mx-auto w-[50px] max-w-[90%] rounded-lg md:max-w-[500px]"
                    side={width <= 640 ? "top" : "right"}
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
                        <DropdownMenuItem
                          key={index}
                          data-test-id={testIDFormatter(
                            "sdnavmenu-ftr-" + item.title?.split("").join(""),
                          )}
                        >
                          <ICON className="mr-2 h-5 w-5" />
                          {item.title}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
