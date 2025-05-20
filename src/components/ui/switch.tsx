"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "~/lib/utils"

export interface SwitchProps 
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconClassName?: string
  leftLabel?: React.ReactNode
  rightLabel?: React.ReactNode
  rightLabelClassName?: string
  leftLabelClassName?: string
  size?: "default" | "sm" // New size prop, default is "default"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ 
  className, 
  leftIcon, 
  rightIcon,
  iconClassName, 
  leftLabel,
  rightLabel,
  rightLabelClassName,
  leftLabelClassName,
  size = "default", // default size is "default"
  checked: checkedProp,
  onCheckedChange,
  defaultChecked,
  ...props 
}, ref) => {
  const [isCheckedInternal, setIsCheckedInternal] = React.useState(defaultChecked ?? false)
  const isControlled = checkedProp !== undefined
  const checked = isControlled ? checkedProp : isCheckedInternal

  const handleCheckedChange = (newChecked: boolean) => {
    if (!isControlled) {
      setIsCheckedInternal(newChecked)
    }
    onCheckedChange?.(newChecked)
  }

  const switchSizeClasses = size === "sm" ? "h-4 w-8" : "h-6 w-12" // Adjust the size based on the "sm" value

  return (
    <div className="flex items-center gap-2">
      {leftLabel && (
        <label className={cn("text-sm", leftLabelClassName)}>
          {leftLabel}
        </label>
      )}
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          switchSizeClasses, // Add the size class
          className
        )}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none relative flex items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform duration-300",
            size === "sm" ? "h-3 w-3 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" : "h-5 w-5 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0" // Thumb size and translate adjustment
          )}
        >
          {leftIcon && (
            <div className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 flex items-center justify-center transition-opacity duration-300",
              iconClassName,
              checked ? "opacity-0" : "opacity-100"
            )}>
              {leftIcon}
            </div>
          )}
          {rightIcon && (
            <div className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 flex items-center justify-center transition-opacity duration-300",
              iconClassName,
              checked ? "opacity-100" : "opacity-0"
            )}>
              {rightIcon}
            </div>
          )}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
      {rightLabel && (
        <label className={cn("text-sm", rightLabelClassName)}>
          {rightLabel}
        </label>
      )}
    </div>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
