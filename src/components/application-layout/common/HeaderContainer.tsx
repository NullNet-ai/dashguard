"use client";
import React from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

const HeaderContainer: React.FC<any> = ({ children }) => {
  const { open,isBannerPresent } = useSidebar();


  const width = open
    ? "lg:w-[calc(100%-16rem)] lg:left-[16rem] md:w-[calc(100%-265px)] md:left-[258px]"
    : "lg:w-[calc(100%-5rem)] lg:left-[5rem] md:w-[calc(100%-80px)] md:left-[80px]";

  return (
    <div
      className={cn(
        `fixed z-50 w-full bg-background transition-all duration-300 ease-in-out lg:fixed`,
        width,
        isBannerPresent ? 'top-12 md:top-8' : 'top-0',
      )}
    >
      {children}
    </div>
  );
};

export default HeaderContainer;
