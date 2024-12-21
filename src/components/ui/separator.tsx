"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "~/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & { dashed?: boolean }
>(
  (
    { className, orientation = "horizontal", decorative = true, dashed = false, ...props },
    ref
  ) => {
    if (dashed) {
      return (
        <div
          className={cn(
            "shrink-0",
            orientation === "horizontal"
              ? "h-0 w-full border-dashed border-border border-t"
              : "h-full w-0  border-dashed border-border border-l",
            className
          )}
          role="separator"
          {...props}
        />
      )
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }