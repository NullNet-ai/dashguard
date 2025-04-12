"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";

const Accordion = AccordionPrimitive.Root;

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "border-b transition-all duration-200", // Added border-bottom
      bordered: "border border-input rounded-lg mb-3 overflow-hidden transition-all duration-200 hover:border-primary/50",
      minimal: "mb-3 transition-all duration-200", // No border, completely minimal
      shadow: "rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow duration-200 bg-background",
      gradient: "rounded-lg mb-3 bg-gradient-to-br from-background to-muted/30 border border-muted/50 hover:border-primary/50 transition-all duration-200",
      glass: "rounded-lg mb-3 backdrop-blur-sm bg-background/80 border border-muted/30 hover:bg-background/90 transition-all duration-200"
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type AccordionItemVariantProps = VariantProps<typeof accordionItemVariants>;

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    AccordionItemVariantProps {}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(accordionItemVariants({ variant }), className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

type IconTypeOption = "chevron" | "plus" | "chevronRight";
type IconType = IconTypeOption | React.ReactElement;

// Define types for open/close icon customization
type IconStateProps = {
  openIcon?: React.ReactElement;
  closeIcon?: React.ReactElement;
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    hideTriggerIcon?: boolean;
    iconPosition?: "left" | "right";
    iconType?: IconType;
    iconClassName?: string;
    iconState?: IconStateProps;
    transitionDuration?: "fast" | "normal" | "slow";
  }
>(({ 
  className, 
  hideTriggerIcon = false, 
  iconPosition = "right", 
  iconType = "chevron", 
  iconClassName,
  iconState,
  transitionDuration = "normal",
  children, 
  ...props 
}, ref) => {
  // Define transition durations
  const transitionDurations = {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500"
  };
  
  // Use state to track open/closed status
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Create a ref to store the original onClick handler
  const originalOnClickRef = React.useRef(props.onClick);
  
  // Override the onClick handler to update our local state
  React.useEffect(() => {
    originalOnClickRef.current = props.onClick;
  }, [props.onClick]);
  
  // Custom click handler that updates our state and calls the original handler
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(prev => !prev);
    if (originalOnClickRef.current) {
      originalOnClickRef.current(e);
    }
  }, []);
  
  // Override props with our custom click handler
  const triggerProps = {
    ...props,
    onClick: handleClick,
  };
  
  const renderIcon = () => {
    if (hideTriggerIcon) return null;
    
    // If custom open/close icons are provided
    if (iconState?.openIcon && iconState?.closeIcon) {
      // Use our local state to determine which icon to show
      const currentIcon = isOpen ? iconState.openIcon : iconState.closeIcon;
      return React.cloneElement(currentIcon, {
        className: cn(
          "h-4 w-4 shrink-0", 
          `transition-all ${transitionDurations[transitionDuration]} ease-in-out`,
          iconClassName
        ),
      });
    }
    
    // Default icon behavior
    let IconComponent: React.ReactNode;
    
    if (React.isValidElement(iconType)) {
      IconComponent = React.cloneElement(iconType as React.ReactElement, {
        className: cn(
          "h-4 w-4 shrink-0", 
          `transition-transform ${transitionDurations[transitionDuration]}`,
          // Apply rotation based on our local state
          isOpen ? "rotate-180" : "",
          iconClassName
        ),
      });
    } else {
      switch (iconType) {
        case "plus":
          IconComponent = <PlusIcon className={cn(
            "h-4 w-4 shrink-0", 
            `transition-transform ${transitionDurations[transitionDuration]}`,
            // Apply rotation based on our local state
            isOpen ? "rotate-45" : "",
            iconClassName
          )} />;
          break;
        case "chevronRight":
          IconComponent = <ChevronRightIcon className={cn(
            "h-4 w-4 shrink-0", 
            `transition-transform ${transitionDurations[transitionDuration]}`,
            // Apply rotation based on our local state
            isOpen ? "rotate-90" : "",
            iconClassName
          )} />;
          break;
        case "chevron":
        default:
          IconComponent = <ChevronDownIcon className={cn(
            "h-4 w-4 shrink-0", 
            `transition-transform ${transitionDurations[transitionDuration]}`,
            // Apply rotation based on our local state
            isOpen ? "rotate-180" : "",
            iconClassName
          )} />;
          break;
      }
    }
    
    return IconComponent;
  };
  
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center font-medium py-3 px-4",
          `transition-all ${transitionDurations[transitionDuration]} ease-in-out`,
          iconPosition === "right" ? "justify-between" : "justify-start gap-3",
          // Only apply rotation classes if not using custom open/close icons
          !hideTriggerIcon && !iconState && iconType === "chevron" && "[&[data-state=open]>svg]:rotate-180",
          !hideTriggerIcon && !iconState && iconType === "plus" && "[&[data-state=open]>svg]:rotate-45",
          !hideTriggerIcon && !iconState && iconType === "chevronRight" && "[&[data-state=open]>svg]:rotate-90",
          !hideTriggerIcon && "hover:bg-muted/30",
          className,
        )}
        {...triggerProps}
        data-state={isOpen ? "open" : "closed"}
      >
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
    padding?: "none" | "small" | "default" | "large";
    background?: "none" | "light" | "gradient";
    transitionDuration?: "fast" | "normal" | "slow";
  }
>(({ 
  className, 
  padding = "default", 
  background = "none", 
  transitionDuration = "normal",
  children, 
  ...props 
}, ref) => {
  // Define transition durations
  const transitionDurations = {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500"
  };

  const paddingClasses = {
    none: "",
    small: "py-2 px-3",
    default: "py-3 px-4",
    large: "p-5",
  };
  
  const backgroundClasses = {
    none: "",
    light: "bg-muted/20 rounded-b-lg",
    gradient: "bg-gradient-to-b from-transparent to-muted/10 rounded-b-lg",
  };
  
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm",
        `transition-all ${transitionDurations[transitionDuration]} ease-in-out`,
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      )}
      {...props}
    >
      <div className={cn(paddingClasses[padding], backgroundClasses[background], className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
});

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// Export types for external use
export type { IconType, IconStateProps };

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
