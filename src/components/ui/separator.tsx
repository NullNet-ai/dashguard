"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "~/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    dashed?: boolean;
    centered?: boolean;
  }
>(
  (
    { 
      className,
      orientation = "horizontal",
      decorative = true,
      dashed = false,
      centered = false,
      ...props
    },
    ref
  ) => {
    const separatorElement = (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          dashed ? "border border-dashed border-border bg-transparent" : "bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
    )

    if (centered) {
      return (
        <div
          className={cn(
            "flex",
            orientation === "horizontal" ? "w-full items-center" : "h-full justify-center",
          )}
        >
          {separatorElement}
        </div>
      )
    }

    return separatorElement
  }
)

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }