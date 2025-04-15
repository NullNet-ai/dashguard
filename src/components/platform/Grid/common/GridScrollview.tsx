"use client";

import { useContext } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";
import { PINNED_STATE_KEY as sideDrawerIsPinned, useSideDrawer } from '~/components/platform/SideDrawer/SideDrawerProvider'; 
import { GridContext } from '../Provider';

export const GridScrollView = ({ children, className, parentType }: any) => {
  const { open } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6)
  const {state: drawerState} = useSideDrawer()

  const {state:gridState} = useContext(GridContext)
  const { dimentionOptions } = gridState?.config || {};

  const finalwidth = parentType === 'record' ? _width - (dimentionOptions?.summaryWidth || 350) : _width

  return (
    <div
      className={cn("grid-scroll-view", className, `${sideDrawerIsPinned ? 'flex-1' : ''} `)}
      style={{ width: sideDrawerIsPinned && (drawerState?.isOpen) ? '100%' : finalwidth + 15 }}
    >
      {children}
    </div>
  );
};
