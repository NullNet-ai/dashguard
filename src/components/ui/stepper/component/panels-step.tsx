import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { type StepProps } from "../stepper";

interface PanelsStepProps extends Omit<StepProps, "index"> {
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  showDescription?: boolean;
  index?: number;
}

export const PanelsStep = ({
  label,
  description,
  status,
  index = 0,
  showLabels = true,
  showDescription = true
}: PanelsStepProps) => {
  const isComplete = status === "complete";
  const isCurrent = status === "current";

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          isComplete
            ? "bg-primary text-primary-foreground"
            : isCurrent
              ? "border-2 border-primary bg-background text-primary"
              : "bg-muted text-muted-foreground"
        )}
      >
        {isComplete ? <CheckIcon className="h-5 w-5" /> : index + 1}
      </div>
      <div className="ml-3">
        {showLabels && (
          <div className={cn(
            "text-sm font-medium",
            isComplete || isCurrent ? "text-primary" : "text-muted-foreground"
          )}>
            {label}
          </div>
        )}
        {description && showDescription && (
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};