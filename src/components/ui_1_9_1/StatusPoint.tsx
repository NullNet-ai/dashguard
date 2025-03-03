"use client"

import * as React from "react"

import { cn } from "~/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const pointColor = cva(
    " w-2 h-2 rounded-full",
    {
      variants: {
        variant: {
            primary:
            "bg-primary",
          secondary:
            "bg-muted",
          success:
            "bg-success",
          destructive:
            "bg-destructive",
          outline: "text-foreground",
        },
      },
      defaultVariants: {
        variant: "primary",
      },
    }
  )
  export interface StatusPointProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pointColor> {}
  

function StatusPoint({ variant, ...props }: StatusPointProps) {
  return (
    <div className={cn(pointColor({ variant }))} {...props} />
  )
}

export { StatusPoint }
