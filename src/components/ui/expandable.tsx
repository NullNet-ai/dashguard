"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "~/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const Expandable = AccordionPrimitive.Root;

const ExpandableItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("bg-background rounded-md mb-2", className)}
    {...props}
  />
));
ExpandableItem.displayName = "ExpandableItem";

const ExpandableTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    hideTriggerIcon?: boolean;
  }
>(({ className, hideTriggerIcon = false, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex bg-slate-100 flex-1 items-center justify-between font-medium p-2",
        !hideTriggerIcon &&
          "transition-all hover:bg-slate-200 [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      {!hideTriggerIcon && (
        <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
ExpandableTrigger.displayName = "ExpandableTrigger";

const ExpandableContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("p-2", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

ExpandableContent.displayName = "ExpandableContent";

export { Expandable, ExpandableItem, ExpandableTrigger, ExpandableContent };