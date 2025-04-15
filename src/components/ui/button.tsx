import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ArrowPathIcon as Loader2 } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

const buttonVariants = cva(
  "transition duration-200 inline-flex items-center justify-center whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border-none active:bg-primary/80 active:shadow-inner",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 active:shadow-inner",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 active:text-accent-foreground active:shadow-inner",
        soft: "bg-primary/10 hover:bg-primary/20 text-primary active:bg-primary/30 active:shadow-inner",
        softPrimary: "bg-primary/10 hover:bg-primary/20 text-primary active:bg-primary/30 active:shadow-inner",
        softDestructive: "bg-destructive/10 hover:bg-destructive/20 text-destructive active:bg-destructive/30 active:shadow-inner",
        softAccent: "bg-accent/10 hover:bg-accent/20 text-accent active:bg-accent/30 active:shadow-inner",
        softSecondary: "bg-secondary/10 hover:bg-secondary/20 text-secondary active:bg-secondary/30 active:shadow-inner",
        secondary: "bg-secondary text-secondary-foreground hover:bg-slate-50 border border-[#E2E8F0] active:bg-slate-100 active:shadow-inner",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/50 active:text-accent-foreground active:shadow-inner",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        expandIcon: "group relative text-primary-foreground bg-primary hover:bg-primary/90 active:bg-primary/80 active:shadow-inner",
        ringHover: "bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2 active:bg-primary/80 active:shadow-inner",
        gooeyRight: "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-zinc-400 before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:shadow-inner",
        gooeyLeft: "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-zinc-400 after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%] active:shadow-inner",
        linkHover1: "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300 active:text-primary/80",
        linkHover2: "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300 active:text-primary/80",
        info: "bg-info text-white hover:bg-info/90 active:bg-info/80 active:shadow-inner",
        success: "bg-success text-white hover:bg-success/90 active:bg-success/80 active:shadow-inner",
        warning: "bg-warning text-white hover:bg-warning/90 active:bg-warning/80 active:shadow-inner",
        plain: "bg-transparent border-none cursor-pointer text-foreground hover:text-primary active:text-primary/80",
      },
      size: {
        default: "h-[34px] px-2",
        xs: "h-7 px-2",
        sm: "h-7 px-2",
        md: "h-[34px] px-2",
        lg: "h-[40px] px-3",
        icon: "h-10 w-10",
      },
      borderRadius: {
        "soft-edged": "rounded",
        rounded: "rounded-full",
        squared: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      borderRadius: "soft-edged",
    },
  },
);

interface IconProps {
  Icon?: React.ElementType;
  iconPlacement?: "left" | "right";
  iconClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
}

// Add tooltip interface
interface TooltipProps {
  tooltipContent?: React.ReactNode;
  showTooltip?: boolean;
  tooltipDelay?: number;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipAlign?: "center" | "start" | "end";
  tooltipSideOffset?: number;
  tooltipAlignOffset?: number;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export type ButtonIconProps = IconProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps & TooltipProps
>(
  (
    {
      name,
      className,
      variant,
      size,
      asChild = false,
      loading,
      Icon,
      iconClassName,
      iconPlacement = "right",
      borderRadius,
      // Tooltip props with defaults
      tooltipContent,
      showTooltip = true,
      tooltipDelay = 300,
      tooltipSide = "top",
      tooltipAlign = "center",
      tooltipSideOffset = 4,
      tooltipAlignOffset = 0,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const hasChildren = !!props.children;
    
    // Determine if this is an icon-only button
    const isIconOnly = Icon && !hasChildren;
    
    // Button content component
    const ButtonContent = (
      <Comp
        data-test-id={name}
        className={cn(buttonVariants({ 
          variant, 
          size: isIconOnly && size !== 'icon' ? 'icon' : size, 
          className,
          borderRadius 
        }))}
        ref={ref}
        disabled={loading}
        type="button"
        {...props}
      >
        <Fragment>
          {/* Icon on the left side */}
          {Icon &&
            iconPlacement === "left" &&
            variant !== "expandIcon" &&
            !loading && !isIconOnly && (
              <div className={cn("w-5", hasChildren ? "lg:-translate-x-[50%] mr-1" : "")}>
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
          
          {/* Expand icon on the left */}
          {Icon &&
            iconPlacement === "left" &&
            variant === "expandIcon" &&
            !loading && !isIconOnly && (
              <div className="group-hover:translate-x-100 w-0 -translate-x-[50%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className={cn("h-5 w-5", iconClassName)} />
                )}
              </div>
            )}

          {/* Icon-only button */}
          {isIconOnly && !loading && (
            <Icon className={cn("h-5 w-5", iconClassName)} />
          )}

          {/* Button content */}
          {!isIconOnly && (
            <Slottable>
              {loading && iconPlacement === "left" && (
                <Loader2
                  className={cn("h-5 w-5 animate-spin", hasChildren && "mr-2")}
                />
              )}
              {props.children}
              {loading && iconPlacement === "right" && (
                <Loader2
                  className={cn("h-5 w-5 animate-spin", hasChildren && "ml-2")}
                />
              )}
            </Slottable>
          )}
          
          {/* Icon on the right side */}
          {Icon &&
            iconPlacement === "right" &&
            variant !== "expandIcon" &&
            !loading && !isIconOnly && (
              <div className={cn("w-5", hasChildren ? "lg:translate-x-[50%] ml-1" : "")}>
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
          
          {/* Expand icon on the right */}
          {Icon &&
            iconPlacement === "right" &&
            variant === "expandIcon" &&
            !loading && !isIconOnly && (
              <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
        </Fragment>
      </Comp>
    );

    // If tooltip is disabled or no content, just return the button
    if (!showTooltip || !tooltipContent) {
      return ButtonContent;
    }

    // Return button with tooltip
    return (
      <TooltipProvider delayDuration={tooltipDelay}>
        <Tooltip>
          <TooltipTrigger asChild>
            {ButtonContent}
          </TooltipTrigger>
          <TooltipContent 
            side={tooltipSide}
            align={tooltipAlign}
            sideOffset={tooltipSideOffset}
            alignOffset={tooltipAlignOffset}
          >
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
