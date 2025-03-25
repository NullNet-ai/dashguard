import React from "react";
import { cn } from "~/lib/utils";
import { type StepProps } from "../stepper";

interface ProgressBarStepProps extends Omit<StepProps, "index"> {
    orientation?: "horizontal" | "vertical";
    showLabels?: boolean;
    showDescription?: boolean;
    index?: number;
    stepLabel?: string;
    stepLabelFormat?: string;
    customDetails?: React.ReactNode;
}

export const ProgressBarStep = ({
    label,
    description,
    status,
    orientation = "horizontal",
    showLabels = true,
    showDescription = true,
    customDetails
}: ProgressBarStepProps) => {
    const isComplete = status === "complete";
    const isCurrent = status === "current";

    return (
        <div className="flex flex-col items-start">
            {orientation === "horizontal" && showLabels && (
                <div className={cn(
                    "text-sm font-medium",
                    isComplete || isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                    {label}
                </div>
            )}
            {orientation === "horizontal" && description && showDescription && (
                <div className="text-xs text-muted-foreground">{description}</div>
            )}
            {orientation === "horizontal" && customDetails && (
                <div className="mt-2 text-xs">{customDetails}</div>
            )}
        </div>
    );
};