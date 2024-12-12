"use client";
import React from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

const HeaderContainer: React.FC<any> = ({ children }) => {
  const { open } = useSidebar();

  const width = open ? "lg:w-[calc(100%-16rem)] lg:left-[16rem] md:w-[calc(100%-265px)] md:left-[258px]" 
    : "lg:w-[calc(100%-3rem)] lg:left-[3rem] md:w-[calc(100%-60px)] md:left-[52px]";

  return (
    <div className={cn("top-0 z-50 bg-background fixed lg:fixed w-full transition-all duration-300 ease-in-out", width)}>
      {children}
    </div>
  );
};

export default HeaderContainer;
