import { CheckIcon } from 'lucide-react';
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { cn } from "~/lib/utils";
import { CirclesStep } from './component/circles-step';
import { HorizontalCirclesStep } from './component/horizontal/circles-step';
import { HorizontalPanelStep } from './component/horizontal/panel-step';
import { PanelsBorderedStep } from './component/panels-bordered-step';
import { PanelsStep } from './component/panels-step';
import { ProgressBarStep } from './component/progress-bar-step';
import { SimpleStep } from './component/simple-step';
// Update the HorizontalDefaultStep component to properly use the Step component
import { HorizontalDefaultStep } from './component/horizontal/default-step';
import { PanelConnector } from './component/horizontal/panel-connector';
import { StepSpacer } from './component/horizontal/step-spacer';

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepProps {
  label?: string;
  description?: string;
  status: StepStatus;
  index: number;
  stepLabel?: string; // New prop for custom step label
  customDetails?: React.ReactNode; // For custom details content
  required?: boolean; // To mark steps as required or optional
  disabled?: boolean; // To disable interaction with certain steps
}

export interface StepperProps {
  steps: Omit<StepProps, "index" | "status">[] | Omit<StepProps, "index">[];
  currentStep: number;
  variant?: "simple" | "panels" | "panelsBordered" | "circles" | "progressBar" | "circlesDropdown" | "bullets" | "platform-stepper";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  showDescription?: boolean;
  stepLabelFormat?: string; // New prop for step label format
  onStepClick?: (stepIndex: number) => void; // Callback for step navigation
}

const Step = ({
  label,
  description,
  status,
  index,
  variant = "simple",
  orientation = "horizontal",
  stepLabel,
  stepLabelFormat = "Step {step}",
  showLabels = true,
  showDescription = true,
  customDetails // Add customDetails to props
}: StepProps & {
  variant?: StepperProps["variant"];
  orientation?: StepperProps["orientation"];
  stepLabelFormat?: string;
  showLabels?: boolean;
  showDescription?: boolean;
}) => {
  // Format step label
  const getStepLabel = () => {
    if (stepLabel) return stepLabel;
    return stepLabelFormat.replace("{step}", (index + 1).toString());
  };

  // Render different step styles based on variant
  const renderStep = () => {
    switch (variant) {
      case "simple":
        return (
          <SimpleStep
            label={getStepLabel()}
            description={description}
            status={status}
            orientation={orientation}
            showLabels={showLabels}
            showDescription={showDescription}
            customDetails={customDetails} // Add customDetails prop
          />
        );

      case "panels":
        return (
          <PanelsStep
            label={getStepLabel()}
            description={description}
            status={status}
            index={index}
            showLabels={showLabels}
            showDescription={showDescription}
          />
        );

      case "panelsBordered":
        return (
          <PanelsBorderedStep
            label={getStepLabel()}
            description={description}
            status={status}
            index={index}
            showLabels={showLabels}
            showDescription={showDescription}
          />
        );

      case "circles":
        return (
          <CirclesStep
            label={getStepLabel()}
            description={description}
            status={status}
            orientation={orientation}
            showLabels={showLabels}
            showDescription={showDescription}
          />
        );


      case "progressBar":
        return (
          <ProgressBarStep
            label={getStepLabel()}
            description={description}
            status={status}
            orientation={orientation}
            showLabels={showLabels}
            showDescription={showDescription}
            customDetails={customDetails} // Add customDetails prop
          />
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
  showDescription = true,
  stepLabelFormat = "Step {step}",
  onStepClick
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

  // Handle step click - only allow navigation to completed steps or the next available step
  const handleStepClick = (index: number) => {
    if (!onStepClick) return;

    // Can't navigate to disabled steps
    if (stepsWithStatus[index]?.disabled) return;

    // Can always go back to previous steps
    if (index < currentStep) {
      onStepClick(index);
      return;
    }

    // Can only go forward one step at a time
    if (index === currentStep + 1) {
      // Check if there are required steps that haven't been completed
      const hasIncompleteRequiredSteps = stepsWithStatus
        .slice(0, currentStep + 1)
        .some(step => step.required !== false && step.status !== "complete");

      if (!hasIncompleteRequiredSteps) {
        onStepClick(index);
      }
    }
  };


  // Horizontal stepper layout
  if (orientation === "horizontal") {
    return (
      <div className="w-full">
        <div className={cn(
          "w-full flex mb-4",
        )}>
          {stepsWithStatus.map((step, index) => {
            // Always make steps clickable and let onStepClick handle the validation
            return (
              <React.Fragment key={index}>
                <div className={cn(
                  "flex flex-col items-start flex-1",
                  (variant === "panelsBordered" || variant === "circles") && "relative",
                  "cursor-pointer hover:opacity-80 transition-all", // 
                  step.disabled && "opacity-50"
                )}
                  onClick={() => {
                    if (onStepClick) {
                      onStepClick(index);
                    }
                  }}>

                  {(variant === "panels" || variant === "panelsBordered") ? (
                    <HorizontalPanelStep
                      label={step.label}
                      description={step.description}
                      status={step.status}
                      variant={variant as "panels" | "panelsBordered"}
                      showLabels={showLabels}
                      showDescription={showDescription}
                      index={index}
                      isLastStep={index === stepsWithStatus.length - 1}
                      customDetails={step.customDetails} // Add customDetails prop
                    />
                  ) : variant === "circles" ? (
                    <HorizontalCirclesStep
                      label={step.label}
                      description={step.description}
                      status={step.status}
                      showLabels={showLabels}
                      showDescription={showDescription}
                      index={index}
                      isLastStep={index === stepsWithStatus.length - 1}
                      currentStep={currentStep}
                      customDetails={step.customDetails} // Add customDetails prop
                    />
                  ) : (
                    <HorizontalDefaultStep
                      {...step}
                      currentStep={currentStep}
                      variant={variant}
                      orientation={orientation}
                      stepLabelFormat={stepLabelFormat}
                      showLabels={showLabels}
                      showDescription={showDescription}
                      Step={Step} // Pass the Step component as a prop
                    />
                  )}

                  {/* Rotated box for panelsBordered */}
                  {variant === "panelsBordered" && index < stepsWithStatus.length - 1 && (
                    <PanelConnector />
                  )}
                </div>
                <StepSpacer
                  variant={variant}
                  index={index}
                  stepsLength={stepsWithStatus.length}
                />
              </React.Fragment>)
          }
          )}
        </div>
      </div>
    );
  }

  // Vertical stepper layout
  return (
    <div className="flex flex-col w-full">
      {variant === "circles" ? (
        <div className="flex flex-col space-y-8">
          {stepsWithStatus.map((step, index) => {
            // Always make steps clickable and let onStepClick handle the validation
            const stepContent = (
              <div className="flex items-start relative min-h-[40px]">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border flex-shrink-0 z-10 bg-white cursor-pointer transition-all",
                    step.status === "complete"
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/80"  // Enhanced hover
                      : step.status === "current"
                        ? "bg-white border-primary hover:bg-primary/20"  // Enhanced hover
                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:bg-gray-50",  // Enhanced hover
                    step.disabled && "opacity-50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStepClick) {
                      onStepClick(index);
                    }
                  }}
                >
                  {step.status === "complete" ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : step.status === "current" ? (
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  ) : (
                    // Change from gray to transparent for inactive steps
                    <div className="h-2 w-2 rounded-full bg-transparent"></div>
                  )}
                </div>

                {/* Add label and description for panels and panelsBordered */}
                <div className="ml-4">
                  {showLabels && (
                    <div className={cn(
                      "text-sm font-medium",
                      step.status === "current" ? "text-primary" :
                        step.status === "complete" ? "text-foreground" : "text-muted-foreground",
                      step.disabled && "opacity-50"
                    )}>
                      {step.label}

                    </div>
                  )}
                  {step.description && showDescription && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                  {step.customDetails && (
                    <div className="mt-2 text-xs">
                      {step.customDetails}
                    </div>
                  )}
                </div>

                {index < stepsWithStatus.length - 1 && (
                  <div className="absolute h-[calc(100%+2rem)] border-l-2 border-gray-200 left-3 top-6 -translate-x-1/2" />
                )}
              </div>
            );

            return (
              <button
                key={index}
                onClick={() => onStepClick && onStepClick(index)}
                className={cn(
                  "text-left w-full",
                  "hover:bg-muted/50 rounded-md transition-colors",
                  step.disabled && "opacity-50"
                )}
              >
                {stepContent}
              </button>
            );
          })}
        </div>
      ) : variant === "circlesDropdown" ? (
        <div className="flex flex-col space-y-4">
          {stepsWithStatus.map((step, index) => {
            return (
              <div key={index} className="relative">
                {/* Add connecting line between steps */}
                {index < stepsWithStatus.length - 1 && (
                  <div className="absolute h-[calc(100%+1rem)] border-l-2 border-gray-200 left-3 top-6 -translate-x-1/2" />
                )}

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value={`item-${index}`} className="border-0">
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border flex-shrink-0 z-10 bg-white mr-3",
                          step.status === "complete"
                            ? "bg-primary text-primary-foreground border-primary"
                            : step.status === "current"
                              ? "bg-white border-primary"
                              : "bg-white border-gray-200 text-gray-400",
                          step.disabled && "opacity-50",
                          "cursor-pointer"
                        )}
                        onClick={(e) => {
                          // Prevent event from bubbling up to accordion
                          e.stopPropagation();
                          if (onStepClick && !step.disabled) {
                            onStepClick(index);
                          }
                        }}
                      >
                        {step.status === "complete" ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : step.status === "current" ? (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        ) : (
                          // Change from gray to transparent for inactive steps
                          <div className="h-2 w-2 rounded-full bg-transparent"></div>
                        )}
                      </div>
                      <AccordionTrigger
                        className={cn(
                          "py-2 hover:no-underline flex-1 justify-normal gap-2",
                          "cursor-pointer",
                          step.disabled && "opacity-50"
                        )}
                      >
                        {showLabels && (
                          <div className={cn(
                            "text-sm font-medium",
                            step.status === "current" ? "text-primary" :
                              step.status === "complete" ? "text-foreground" : "text-muted-foreground",
                            step.disabled && "opacity-50"
                          )}>
                            {step.label}
                          </div>
                        )}
                      </AccordionTrigger>
                    </div>
                    <AccordionContent>
                      <div className="pl-9">
                        {step.description && showDescription && (
                          <div className="text-sm text-muted-foreground py-1">
                            {step.description}
                          </div>
                        )}
                        {step.customDetails && (
                          <div className="mt-2">
                            {step.customDetails}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </div>
      ) : variant === "bullets" ? (
        <div className="flex flex-col space-y-6">
          {stepsWithStatus.map((step, index) => {


            const stepContent = (
              <div className="flex items-start">
                <div
                  className={cn(
                    "flex h-3 w-3 mt-[2.5px] items-center justify-center rounded-full flex-shrink-0 cursor-pointer transition-all",
                    step.status === "complete"
                      ? "bg-primary hover:bg-primary/80"  // Enhanced hover
                      : step.status === "current"
                        ? "bg-indigo-100 hover:bg-indigo-300"  // Enhanced hover
                        : "bg-transparent hover:bg-muted/70",  // Enhanced hover
                    step.disabled && "opacity-50"
                  )}
                  onClick={(e) => {
                    // Stop propagation to prevent accordion toggle
                    e.stopPropagation();
                    if (onStepClick) {
                      onStepClick(index);
                    }
                  }}
                >
                  {step.status === "complete" ? (
                    <CheckIcon className="h-2.5 w-2.5 text-white" />
                  ) : (
                    /* Small white circle inside for current and upcoming */
                    <div className={cn("size-[6px] rounded-full ",
                      step.status === "current" ? "bg-primary" : "bg-muted-foreground",
                    )}></div>
                  )}
                </div>

                <div className="ml-4">
                  {showLabels && (
                    <div className={cn(
                      "text-sm font-medium",
                      step.status === "current" ? "text-primary" :
                        step.status === "complete" ? "text-foreground" : "text-muted-foreground",
                      step.disabled && "opacity-50"
                    )}>
                      {step.label}
                    </div>
                  )}
                  {step.description && showDescription && (
                    <div className={`text-xs text-muted-foreground mt-1 ${step.disabled && "opacity-50"}`}>
                      {step.description}
                    </div>
                  )}
                  {step.customDetails && (
                    <div className={`mt-2 text-xs ${step.disabled && "opacity-50"}`}>
                      {step.customDetails}
                    </div>
                  )}
                </div>
              </div>
            );



            return <div key={index} className="p-2">{stepContent}</div>;
          })}
        </div>
      ) : variant === "platform-stepper" ? (
        <div className="flex flex-col w-full">
          {stepsWithStatus.map((step, index) => {
            return (
              <div key={index} className="relative mb-4">
                {/* Add connecting line between steps that connects with the bullet points */}
                {index < stepsWithStatus.length - 1 && (
                  <div
                    className="absolute border-l-2 border-gray-200 left-[5.2px] z-0"
                    style={{
                      top: "0.85rem", /* Position at the center of the bullet */
                      bottom: "-1.2rem", /* Extend down to connect with the next bullet */
                      height: "auto" /* Let the height be determined by top and bottom */
                    }}
                  />
                )}

                <div className="flex items-center mb-1">
                  <div
                    className={cn(
                      "flex h-3 w-3 items-center justify-center rounded-full mr-3 flex-shrink-0 z-10 relative transition-all",
                      step.status === "current"
                        ? "border-[3px] border-primary bg-transparent hover:bg-primary/10"
                        : step.status === "complete"
                          ? "bg-indigo-100 hover:bg-indigo-300"
                          : "bg-transparent border border-gray-300 hover:bg-muted/70",
                      step.disabled && "opacity-50",
                      !step.disabled && "cursor-pointer"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStepClick && !step.disabled) {
                        onStepClick(index);
                      }
                    }}
                  >
                    {step.status === "current" ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    ) : (
                      <div className={cn("h-1.5 w-1.5 rounded-full",
                        step.status === "complete" ? "bg-primary" : "bg-transparent"
                      )}></div>
                    )}
                  </div>
                  <div className="text-sm font-medium">Step {index + 1}</div>
                </div>

                <div className="pl-7">
                  <Accordion type="multiple" className="w-full">
                    {/* Rest of the accordion content remains the same */}
                    <AccordionItem value={`item-${index}`} className="border-0">
                      <AccordionTrigger
                        className={cn(
                          "py-1 hover:no-underline cursor-pointer justify-normal gap-2",
                          "hover:bg-muted/50 rounded-sm transition-all", // Enhanced hover
                          step.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={(e) => {
                          // Remove e.preventDefault() to allow accordion toggle
                          if (!step.disabled) {
                            handleStepClick(index);
                          }
                        }}
                      >
                        {showLabels && (
                          <div className={cn(
                            "text-sm font-medium",
                            step.status === "complete" ? "text-primary" :
                              step.status === "current" ? "text-foreground" : "text-muted-foreground",
                            step.disabled && "opacity-50"
                          )}>
                            {step.label}
                          </div>
                        )}
                      </AccordionTrigger>
                      <AccordionContent>
                        {step.description && showDescription && (
                          <div className="text-sm text-muted-foreground py-1">
                            {step.description.split('\n').map((line, i) => (
                              <div key={i} className="py-0.5">{line}</div>
                            ))}
                          </div>
                        )}
                        {step.customDetails && (
                          <div className="mt-2">
                            {step.customDetails}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {stepsWithStatus.map((step, index) => {
            return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger
                  className={cn(
                    "py-2",
                    "cursor-pointer hover:no-underline hover:opacity-50 justify-normal gap-2",
                    step.disabled && "opacity-50"
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center mr-3",
                        step.status === "complete"
                          ? "bg-primary/10 text-primary"
                          : step.status === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        step.disabled && "opacity-50"
                      )}
                      onClick={(e) => {
                        // Prevent event from bubbling up to accordion
                        e.stopPropagation();
                        if (onStepClick && !step.disabled) {
                          onStepClick(index);
                        }
                      }}
                    >
                      {step.status === "complete" ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium">{step.label}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {step.description && showDescription && (
                    <div className="text-sm text-muted-foreground pl-11">
                      {step.description}
                    </div>
                  )}
                  {step.customDetails && (
                    <div className="mt-2 pl-11">
                      {step.customDetails}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}