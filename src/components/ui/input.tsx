import * as React from "react";

import { cn } from "~/lib/utils";
import { Label } from "./label";
import { type Badge } from "./badge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  Icon?: React.ElementType;
  iconPlacement?: "left" | "right";
  label?: string;
  Badge?: typeof Badge;
  hasError?: boolean;
  iconClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
  leftAddon?: React.ReactNode | string;
  rightAddon?: React.ReactNode | string;
  containerClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      autoComplete = "off",
      Icon = null,
      iconClassName,
      containerClassName,
      iconPlacement = "right",
      label,
      name,
      hasError,
      leftAddon,
      rightAddon,
      readOnly,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        {label && <Label htmlFor={name}>{label}</Label>}

        <div className={cn("relative w-full",containerClassName)}>
          {leftAddon && (
            <div
              className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 transform`}
            >
              {typeof leftAddon === "string" ? (
                <span className="text-muted-foreground">{leftAddon}</span>
              ) : (
                leftAddon
              )}
            </div>
          )}
          {!leftAddon && Icon && iconPlacement === "left" && (
            <div
              className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 transform`}
            >
              <Icon
                className={cn("h-5 w-5 text-muted-foreground", iconClassName)}
              />
            </div>
          )}
          <input
            data-test-id={name}
            type={type}
            name={name}
            autoComplete={autoComplete}
            className={cn(
              "flex  w-full read-only:cursor-text h-[36px] rounded-md border border-input bg-background px-[8px] py-1 md:text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:border-primary  sm:text-md/6 disabled:bg-secondary text-lg  disabled:text-gray-400 disabled:border-gray-300",
              (leftAddon || (Icon && iconPlacement === "left")) && "pl-7",
              (rightAddon || (Icon && iconPlacement === "right")) && "pr-7",
              className,
              {
                "border-destructive": hasError,
                "": !hasError,
              },
            )}
            ref={ref}
            readOnly={readOnly}
            {...props}
          />
          {rightAddon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
              {typeof rightAddon === "string" ? (
                <span className="text-muted-foreground">{rightAddon}</span>
              ) : (
                rightAddon
              )}
            </div>
          )}
          {!rightAddon && Icon && iconPlacement === "right" && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
              <Icon
                className={cn("h-5 w-5 text-muted-foreground", iconClassName)}
              />
            </div>
          )}
        </div>
      </>
    );
  },
);
Input.displayName = "Input";

export { Input };
