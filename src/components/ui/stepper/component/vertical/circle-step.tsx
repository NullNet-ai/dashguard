import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { type StepProps } from "../../stepper";

interface VerticalCircleStepProps extends StepProps {
  onStepClick?: (index: number) => void;
  showLabels?: boolean;
  showDescription?: boolean;
  stepsLength: number;
}

export const VerticalCircleStep = ({
  index,
  status,
  label,
  description,
  customDetails,
  required,
  disabled,
  onStepClick,
  showLabels = true,
  showDescription = true,
  stepsLength
}: VerticalCircleStepProps) => {
  const stepContent = (
    <div className="flex items-start relative min-h-[40px]">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border flex-shrink-0 z-10 bg-white cursor-pointer",
          status === "complete"
            ? "bg-primary text-primary-foreground border-primary"
            : status === "current"
              ? "bg-white border-primary"
              : "bg-white border-gray-200 text-gray-400",
          disabled && "opacity-50"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (onStepClick) {
            onStepClick(index);
          }
        }}
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4" />
        ) : status === "current" ? (
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        )}
      </div>

      <div className="ml-4">
        {showLabels && (
          <div className={cn(
            "text-sm font-medium flex items-center gap-2",
            status === "current" ? "text-primary" :
              status === "complete" ? "text-foreground" : "text-muted-foreground",
            disabled && "opacity-50"
          )}>
            {label}
            {required !== false && (
              <span className="text-xs text-red-500">*</span>
            )}
          </div>
        )}
        {description && showDescription && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
        {customDetails && (
          <div className="mt-2 text-xs">
            {customDetails}
          </div>
        )}
      </div>

      {index < stepsLength - 1 && (
        <div className="absolute h-[calc(100%+2rem)] border-l-2 border-gray-200 left-3 top-6 -translate-x-1/2" />
      )}
    </div>
  );

  return (
    <button
      onClick={() => onStepClick && onStepClick(index)}
      className={cn(
        "text-left w-full",
        "hover:bg-muted/50 rounded-md transition-colors",
        disabled && "opacity-50"
      )}
    >
      {stepContent}
    </button>
  );
};