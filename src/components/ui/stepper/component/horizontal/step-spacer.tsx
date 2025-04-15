import React from "react";
import { cn } from "~/lib/utils";

interface StepSpacerProps {
  className?: string;
  variant?: string;
  index?: number;
  stepsLength?: number;
}

export const StepSpacer = ({ 
  className,
  variant = "simple",
  index = 0,
  stepsLength = 1
}: StepSpacerProps) => {
  // No spacing for these variants
  if (variant === "panels" || variant === "panelsBordered" || variant === "circles" || variant === "progressBar") {
    return <div className="w-0"></div>;
  }
  
  // Default spacing for other variants
  if (index < stepsLength - 1) {
    return <div className={cn("w-[5%] max-w-8 min-w-4", className)}></div>;
  }
  
  return null;
};