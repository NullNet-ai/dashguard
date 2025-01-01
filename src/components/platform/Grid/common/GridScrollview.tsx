"use client";

import { useEffect, useRef, useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";

export const GridScrollView = ({ children, className }: any) => {
  const { open } = useSidebar();
  const { width } = useWindowSize();
  const _width = open ? width - remToPx(17) : width - remToPx(5.5);
 
  return (
    <div
      className={cn("grid-scroll-view", className)}
      style={{ width: _width + 15 }}
    >
      {children}
    </div>
  );
};
