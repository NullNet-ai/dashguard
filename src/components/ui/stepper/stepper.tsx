import { CheckIcon } from 'lucide-react';
import React from "react";
import { cn } from "~/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepProps {
  label: string;
  description?: string;
  status: StepStatus;
  index: number;
}

export interface StepperProps {
  steps: Omit<StepProps, "index" | "status">[] | Omit<StepProps, "index">[];
  currentStep: number;
  variant?: "simple" | "panels" | "panelsBordered" | "circles" | "progressBar";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
}

const Step = ({
  label,
  description,
  status,
  index,
  variant = "simple",
  orientation = "horizontal",
}: StepProps & {
  variant?: StepperProps["variant"];
  orientation?: StepperProps["orientation"];
}) => {
  const isComplete = status === "complete";
  const isCurrent = status === "current";

  // Common status-based styling
  const getStatusClasses = () => {
    if (isComplete) return "bg-primary text-primary-foreground";
    if (isCurrent) return "bg-primary text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  // Render different step styles based on variant
  const renderStep = () => {
    switch (variant) {
      case "simple":
        return (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-1 w-full",
                isComplete || isCurrent ? "bg-primary" : "bg-muted"
              )}
            />
            {orientation === "horizontal" && (
              <div className="mt-2 text-sm">{label}</div>
            )}
          </div>
        );

      case "panels":
        return (
          <div className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                getStatusClasses()
              )}
            >
              {isComplete ? <CheckIcon className="h-5 w-5" /> : index + 1}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{label}</div>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </div>
        );

      case "panelsBordered":
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
            <div className="ml-3">
              <div className="text-sm font-medium">{label}</div>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </div>
        );

      case "circles":
        return (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                getStatusClasses()
              )}
            >
              {isComplete ? <CheckIcon className="h-5 w-5" /> : index + 1}
            </div>
            {orientation === "horizontal" && (
              <div className="mt-2 text-sm">{label}</div>
            )}
          </div>
        );

      case "progressBar":
        return (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-1 w-full",
                isComplete || isCurrent ? "bg-primary" : "bg-muted"
              )}
            />
            {orientation === "horizontal" && (
              <div className="mt-2 text-sm">{label}</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
};

export function Stepper({
  steps,
  currentStep,
  variant = "simple",
  orientation = "horizontal",
  showLabels = true,
}: StepperProps) {
  // Determine status for each step, but respect any existing status
  const stepsWithStatus = steps.map((step, index) => ({
    ...step,
    status: (step as any).status || 
      (index < currentStep
        ? "complete"
        : index === currentStep
        ? "current"
        : "upcoming"),
    index,
  }));

  // Horizontal stepper layout
  if (orientation === "horizontal") {
    return (
      <div className="w-full">
        <div
          className={cn(
            "flex w-full",
            variant === "progressBar" ? "items-center" : "items-start"
          )}
        >
          {stepsWithStatus.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className={cn(
                  "flex-1",
                  variant === "panels" || variant === "panelsBordered"
                    ? "flex justify-center"
                    : ""
                )}
              >
                <Step
                  {...step}
                  variant={variant}
                  orientation={orientation}
                />
              </div>
              {index < stepsWithStatus.length - 1 &&
                (variant === "circles" || variant === "panels" || variant === "panelsBordered") && (
                  <div
                    className={cn(
                      "flex-1 h-1 self-center",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Vertical stepper layout
  return (
    <div className="flex flex-col space-y-4">
      {stepsWithStatus.map((step, index) => (
        <div key={index} className="flex items-start">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                step.status === "complete"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "current"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.status === "complete" ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < stepsWithStatus.length - 1 && (
              <div
                className={cn(
                  "w-0.5 h-full flex-1 mt-1",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium">{step.label}</div>
            {step.description && (
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}