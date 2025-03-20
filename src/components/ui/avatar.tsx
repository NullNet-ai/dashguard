"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { createPortal } from "react-dom"

import { cn } from "~/lib/utils"

// Status indicator component for online/offline/etc states
  const AvatarStatus = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
      status?: "online" | "offline" | "busy" | "away";
      position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
      containerRef?: React.RefObject<HTMLElement>;
      size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    }
  >(({ className, status = "offline", position = "bottom-right", containerRef, size = "md", ...props }, ref) => {
    const statusColors = {
      online: "bg-success", // Green for online status
      offline: "bg-gray-300", // Gray for offline status
      busy: "bg-danger", // Red for busy status
      away: "bg-warning" // Yellow/Orange for away status
    }
    
    const positionClasses = {
      "top-right": "top-0 right-0",
      "bottom-right": "bottom-0 right-0",
      "top-left": "top-0 left-0",
      "bottom-left": "bottom-0 left-0"
    }
    
    // Increased size values for better visibility
    const statusSizes = {
      "2xs": "h-2 w-2",     // Increased from h-1.5 w-1.5
      xs: "h-2.5 w-2.5",    // Increased from h-2 w-2
      sm: "h-3 w-3",        // Increased from h-2.5 w-2.5
      md: "h-3.5 w-3.5",    // Increased from h-3 w-3
      lg: "h-4 w-4",        // Increased from h-3.5 w-3.5
      xl: "h-4.5 w-4.5",    // Increased from h-4 w-4
      "2xl": "h-5.5 w-5.5"  // Increased from h-5 w-5
    }
    
    const [mounted, setMounted] = React.useState(false)
    
    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])
    
    if (!mounted || !containerRef?.current) return null
    
    return createPortal(
      <span
        ref={ref}
        className={cn(
          "absolute block rounded-full border-2 border-background z-[9999]",
          statusColors[status],
          positionClasses[position],
          statusSizes[size],
          className
        )}
        {...props}
      />,
      containerRef.current
    )
  })
AvatarStatus.displayName = "AvatarStatus"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    statusProps?: Omit<React.ComponentPropsWithoutRef<typeof AvatarStatus>, "containerRef">;
    size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  }
>(({ className, statusProps, size = "md", ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const avatarSizes = {
    "2xs": "h-5 w-5",
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20"
  }
  
  return (
    <div ref={containerRef} className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          avatarSizes[size],
          className
        )}
        {...props}
      />
      {statusProps && <AvatarStatus 
        containerRef={containerRef} 
        size={size} 
        {...statusProps} 
      />}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Placeholder icon component
const AvatarPlaceholder = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    icon?: React.ReactNode;
  }
>(({ className, icon, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground p-0",
      className
    )}
    {...props}
  >
    {icon ? (
      <div className="flex h-full w-full items-center justify-center p-0">
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement, { 
              className: cn("h-full w-full", (icon as React.ReactElement).props.className) 
            }) 
          : icon}
      </div>
    ) : (
      children
    )}
  </AvatarPrimitive.Fallback>
))
AvatarPlaceholder.displayName = "AvatarPlaceholder"

// Avatar with text component
const AvatarWithText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    text?: React.ReactNode;
    subText?: React.ReactNode;
  }
>(({ className, children, text, subText, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3", className)}
    {...props}
  >
    {children}
    {(text || subText) && (
      <div className="flex flex-col justify-center">
        {text && <p className="text-sm font-medium leading-none">{text}</p>}
        {subText && <p className="text-xs text-muted-foreground">{subText}</p>}
      </div>
    )}
  </div>
))
AvatarWithText.displayName = "AvatarWithText"

// Avatar group component (stacks avatars)
const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: "row" | "column";
    overlap?: number;
    max?: number;
    limit?: boolean;
    reverse?: boolean;
    size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  }
>(({ 
  className, 
  children, 
  direction = "row", 
  overlap = 0.5, 
  max, 
  limit = false,
  reverse = false,
  size = "md",
  ...props 
}, ref) => {
  const childrenArray = React.Children.toArray(children);
  const orderedChildren = reverse ? [...childrenArray].reverse() : childrenArray;
  const visibleAvatars = max ? orderedChildren.slice(0, max) : orderedChildren;
  const remainingCount = max && orderedChildren.length > max ? orderedChildren.length - max : 0;
  
  const avatarSizes = {
    "2xs": "h-5 w-5",
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20"
  }
  
  // Calculate overlap to match the image (showing about 30% of each avatar)
  const overlapStyle = direction === "row" 
    ? { marginLeft: `-${overlap * 4}rem` } 
    : { marginTop: `-${overlap * 4}rem` };
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        className
      )}
      {...props}
    >
      {visibleAvatars.map((child, index) => {
        // Calculate z-index based on position, direction and reverse setting
        const zIndex = reverse 
          ? index // If reverse, first items have lower z-index
          : visibleAvatars.length - index; // If not reverse, first items have higher z-index
        
        return (
          <div 
            key={index} 
            style={{
              ...(index !== 0 ? overlapStyle : undefined),
              zIndex: zIndex,
              position: "relative",
            }}
            className="relative"
          >
            {React.cloneElement(child as React.ReactElement, {
              className: cn(
                "border-[2.5px] border-white", 
                (child as React.ReactElement).props.className
              ),
              size: size
            })}
          </div>
        );
      })}
      
      {limit && remainingCount > 0 && (
        <div 
          style={{
            ...overlapStyle,
            zIndex: 0,
            position: "relative",
          }}
          className="relative"
        >
          <div className={cn(
            "flex items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium border-[2.5px] border-white shadow-md",
            avatarSizes[size],
            className
          )}>
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

export { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  AvatarStatus, 
  AvatarPlaceholder, 
  AvatarWithText,
  AvatarGroup
}
