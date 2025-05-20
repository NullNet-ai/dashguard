import React from "react";
import { cn } from "~/lib/utils";
import { type StepProps } from "../../stepper";

interface HorizontalDefaultStepProps extends StepProps {
  variant?: string;
  orientation?: "horizontal" | "vertical";
  stepLabelFormat?: string;
  showLabels?: boolean;
  showDescription?: boolean;
  currentStep?: number;
  Step: React.ComponentType<any>; // Add Step component as a prop
}

export const HorizontalDefaultStep = ({
  index,
  status,
  currentStep = 0,
  variant,
  orientation = "horizontal",
  stepLabelFormat = "Step {step}",
  showLabels = true,
  showDescription = true,
  Step, // Receive Step component
  ...stepProps
}: HorizontalDefaultStepProps) => {
  return (
    <>
      <div className={cn(
        "h-1 w-full",
        index <= currentStep ? "bg-primary" : "bg-muted"
      )} />
      <div className="mt-2">
        <Step
          {...stepProps}
          status={status}
          index={index}
          variant={variant}
          orientation={orientation}
          stepLabelFormat={stepLabelFormat}
          showLabels={showLabels}
          showDescription={showDescription}
        />
      </div>
    </>
  );
};