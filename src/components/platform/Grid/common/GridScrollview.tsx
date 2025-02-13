"use client";

import { useSidebar } from "~/components/ui/sidebar";
import useWindowSize from "~/hooks/use-resize";
import { cn } from "~/lib/utils";
import { remToPx } from "~/utils/fetcher";

export const GridScrollView = ({ children, className, parentType }: any) => {
  const { open } = useSidebar();
  const { width } = useWindowSize();
  const newWidth = width <= 0 ? 1920 : width;
  const _width = open ? newWidth - remToPx(17) : newWidth - remToPx(6);
  
  return (
    <div
      className={cn("grid-scroll-view", className)}
      style={{ width: _width + 15 - (parentType === 'record' ? 325 : 0) }}
    >
      {children}
    </div>
  );
};
