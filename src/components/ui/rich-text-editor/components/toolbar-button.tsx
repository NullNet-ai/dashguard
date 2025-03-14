import * as React from "react";
import type { TooltipContentProps } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Toggle } from "~/components/ui/toggle";
import { cn } from "~/lib/utils";

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: TooltipContentProps;
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    {
      children,
      tooltip,
      isActive,
      size,
      variant,
      disabled,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    
    // Create a handler that prevents default and stops propagation
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      },
      [onClick, disabled]
    );

    return tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            ref={ref}
            size={size}
            variant={variant}
            pressed={isActive}
            disabled={disabled}
            className={cn(
              "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
              "pointer-events-auto", // Ensure clicks are registered
              className
            )}
            onClick={handleClick}
            {...props}
          >
            {children}
            <span className="sr-only">{tooltip}</span>
          </Toggle>
        </TooltipTrigger>
        <TooltipContent {...props.tooltipOptions}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    ) : (
      <Toggle
        ref={ref}
        size={size}
        variant={variant}
        pressed={isActive}
        disabled={disabled}
        className={cn(
          "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          "pointer-events-auto", // Ensure clicks are registered
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Toggle>
    );
  }
);

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
