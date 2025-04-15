import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { type StepProps } from "../../stepper";

// Update the interface to include customDetails
interface HorizontalPanelStepProps extends Omit<StepProps, "index"> {
  variant: "panels" | "panelsBordered";
  showLabels?: boolean;
  showDescription?: boolean;
  index: number;
  isLastStep?: boolean;
  customDetails?: React.ReactNode; // Add customDetails prop
}

// Update the component to destructure and use customDetails
export const HorizontalPanelStep = ({
  label,
  description,
  status,
  variant,
  showLabels = true,
  showDescription = true,
  index,
  isLastStep = false,
  customDetails
}: HorizontalPanelStepProps) => {

  return (
    <div className={cn(
      "flex items-start w-full pt-2",
      "h-full",
      variant === "panelsBordered" && "border border-gray-200 p-2 px-4",
      variant === "panelsBordered" && !isLastStep && "border-r-0",
      variant === "panelsBordered" && status === "current" && "border-b-primary border-b-2"
    )}>
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0 mt-0.5", // Added margin top
          variant === "panelsBordered" && "border",
          status === "complete"
            ? "bg-primary text-primary-foreground border-primary"
            : status === "current"
              ? "border-2 border-primary bg-background text-primary"
              : "bg-transparent border-2 border-gray-300 text-muted-foreground"
        )}
      >
        {status === "complete" ?
          <CheckIcon className="h-4 w-4" /> :
          <span className="text-xs">{index + 1}</span>
        }
      </div>

      {/* Add label and description for panels and panelsBordered */}
      <div className="ml-3 flex-grow">
        {showLabels && (
          <div className={cn(
            "text-sm font-medium",
            status === "current" ? "text-primary" :
              status === "complete" ? "text-foreground" : "text-muted-foreground"
          )}>
            {label}
          </div>
        )}
        {description && showDescription && (
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        )}
        {customDetails && (
          <div className="mt-2 text-xs">
            {customDetails}
          </div>
        )}
      </div>

      {/* For panels variant, keep the rotated box with consistent color */}
      {variant === "panels" && !isLastStep && (
        <div className="h-full flex items-center mx-2 flex-1 justify-end ms-auto me-6">
          <div className="h-full w-8 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rotate-45 transform border-t border-r border-gray-300"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};