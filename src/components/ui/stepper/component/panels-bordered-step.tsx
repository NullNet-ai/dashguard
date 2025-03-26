import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { type StepProps } from "../stepper";

interface PanelsBorderedStepProps extends Omit<StepProps, "index"> {
  showLabels?: boolean;
  showDescription?: boolean;
  index?: number;
}

export const PanelsBorderedStep = ({
  label,
  description,
  status,
  index = 0,
  showLabels = true,
  showDescription = true
}: PanelsBorderedStepProps) => {
  const isComplete = status === "complete";
  const isCurrent = status === "current";

  // Common status-based styling
  const getStatusClasses = () => {
    if (isComplete) return "bg-primary text-primary-foreground";
    if (isCurrent) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="flex items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border",
          isComplete || isCurrent
            ? "border-primary"
            : "border-muted-foreground",
          getStatusClasses()
        )}
      >
        {isComplete ? <CheckIcon className="h-5 w-5" /> : index + 1}
      </div>
      {showLabels && (
        <div className="ml-3">
          <div className="text-sm font-medium">{label}</div>
          {description && showDescription && (
            <div className="text-xs text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};