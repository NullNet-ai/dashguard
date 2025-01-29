"use client";

import { Bars3Icon, ChevronDoubleLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { ChevronLeftIcon } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function TriggerComponent() {
  const {open} = useSidebar();
  return (
    <ChevronDoubleLeftIcon
    className={cn(
      "transition-transform duration-200 h-7 w-7",
      open ? "rotate-180" : "rotate-0",
    )} // Rotate based on the open state
  />
  )
}


export function MobileTriggerComponent(){
  return (
    <Bars3Icon
    className={cn(
      "transition-transform duration-200 h-6 w-6",
    )} 
  />
  )
}



export function TriggerOpenCloseSidebarComponent(){
  const {open} = useSidebar();
  return (
    <div className="bg-background rounded-full shadow flex justify-center w-fit p-1">
      <ChevronRightIcon
      className={cn(
        "transition-transform duration-200 size-7",
        open ? "rotate-180" : "rotate-0",
      )}
      />
    </div> // Rotate based on the open state
  )
}