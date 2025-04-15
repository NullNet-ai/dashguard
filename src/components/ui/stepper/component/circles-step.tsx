import React from "react";
import { CheckIcon } from 'lucide-react';
import { cn } from "~/lib/utils";
import { type StepProps } from "../stepper";

interface CirclesStepProps extends Omit<StepProps, "index"> {
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  showDescription?: boolean;
  index?: number;
}

export const CirclesStep = ({
  label,
  description,
  status,
  orientation = "horizontal",
  showLabels = true,
  showDescription = true
}: CirclesStepProps) => {
  const isComplete = status === "complete";
  const isCurrent = status === "current";

  // Common status-based styling
  const getStatusClasses = () => {
    if (isComplete) return "bg-primary text-primary-foreground";
    if (isCurrent) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          getStatusClasses()
        )}
      >
        {isComplete ? (
          <CheckIcon className="h-5 w-5" />
        ) : isCurrent ? (
          <div className="h-2 w-2 rounded-full bg-primary"></div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
        )}
      </div>
      {orientation === "horizontal" && showLabels && (
        <div className="mt-2 text-sm">{label}</div>
      )}
      {orientation === "horizontal" && description && showDescription && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  );
};