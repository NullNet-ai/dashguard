"use client";

import { useEffect, useRef, useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";
import { PINNED_STATE_KEY as sideDrawerIsPinned, useSideDrawer } from '~/components/platform/SideDrawer/SideDrawerProvider'; 

export const GridScrollView = ({ children, className }: any) => {
  const { open } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6);
  const {state: drawerState} = useSideDrawer()

  return (
    <div
      className={cn("grid-scroll-view", className, `${sideDrawerIsPinned ? 'flex-1' : ''} `)}
      style={{ width: sideDrawerIsPinned && (drawerState?.isOpen) ? '100%' : _width + 15 }}
    >
      {children}
    </div>
  );
};
