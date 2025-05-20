import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-sm font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary ",
        defaultSolid: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        secondarySolid: "border-transparent bg-secondary text-secondary-foreground shadow hover:bg-secondary/80",
        success: "border-transparent bg-success/10 text-success ",
        successSolid: "border-transparent bg-success text-white shadow hover:bg-success/80",
        destructive: "border-transparent bg-destructive/20 text-destructive",
        destructiveSolid: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        warning: "border-transparent bg-warning/10 text-warning ",
        warningSolid: "border-transparent bg-warning text-white shadow hover:bg-warning/80",
        outline: "text-foreground bg-tertiary/10 ",
        outlineSolid: "border-border text-foreground bg-background",
        primary: "border-transparent bg-primary/10 text-primary ",
        primarySolid: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
      },
      borderRadius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      borderRadius: "full",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, borderRadius, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, borderRadius }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants }
