import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { type StepStatus, type StepProps } from "../../stepper";

interface HorizontalCirclesStepProps {
  label?: string;
  description?: string;
  status: StepStatus;
  showLabels?: boolean;
  showDescription?: boolean;
  index: number;
  isLastStep?: boolean;
  currentStep: number;
  customDetails?: React.ReactNode;
}

export const HorizontalCirclesStep = ({
  label,
  description,
  status,
  showLabels = true,
  showDescription = true,
  index,
  isLastStep = false,
  currentStep,
  customDetails
}: HorizontalCirclesStepProps) => {
  return (
    <div className="flex flex-col items-center w-full relative">
      <div className="flex items-center w-full justify-center relative z-20">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border hover:opacity-80 relative z-10",
                status === "complete"
                  ? "bg-primary text-primary-foreground border-primary"
                  : status === "current"
                    ? "bg-white border-primary"
                    : "bg-white border-gray-200 text-gray-400"
              )}
            >
              {status === "complete" ? (
                <CheckIcon className="h-4 w-4" />
              ) : status === "current" ? (
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              ) : (
                // Removing the gray circle for inactive steps
                <div className="h-2 w-2 rounded-full bg-transparent"></div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="font-medium">Step {index + 1}: {label}</div>
            {showDescription && description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
            {customDetails && (
              <div className="mt-2 text-xs">{customDetails}</div>
            )}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Add connecting line for circles variant */}
      {!isLastStep && (
        <div className="absolute top-3 left-1/2 w-full h-0.5 z-0">
          <div className={cn(
            "h-0.5 w-full",
            index < currentStep ? "bg-primary" : "bg-gray-200"
          )}></div>
        </div>
      )}
    </div>
  );
};