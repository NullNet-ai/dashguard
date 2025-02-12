import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary ",
        secondary:
          "border-transparent bg-muted",
        success:
          "border-transparent bg-success/10 text-success ",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground ",
        outline: "text-foreground  bg-tertiary/10 ",
        primary: 'border-transparent bg-primary/10 text-primary ',
        warning: 'border-transparent bg-warning/10 text-warning ',
      },
    defaultVariants: {
      variant: "default",
    },
    },
  }
)

export interface BadgeProps

extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}


  const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={cn(badgeVariants({ variant }), className)}
          {...props}
        />
      );
    }
  );

    Badge.displayName = "Badge";

export { Badge, badgeVariants }
