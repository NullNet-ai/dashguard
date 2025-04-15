import React from "react";
import { cn } from "~/lib/utils";
import { type StepProps } from "../stepper";

interface SimpleStepProps extends Omit<StepProps, "index"> {
    orientation?: "horizontal" | "vertical";
    stepLabelFormat?: string;
    showLabels?: boolean;
    showDescription?: boolean;
    index?: number;
    customDetails?: React.ReactNode;
}

export const SimpleStep = ({
    label,
    description,
    status,
    orientation = "horizontal",
    showLabels = true,
    showDescription = true,
    customDetails
}: SimpleStepProps) => {
    const isComplete = status === "complete";
    const isCurrent = status === "current";

    return (
        <div className="flex flex-col items-start">
            {orientation === "horizontal" && showLabels && (
                <>
                    <div className={cn(
                        "text-sm font-medium",
                        isComplete || isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                        {label}
                    </div>
                    {description && showDescription && 
                        <div className="text-xs text-muted-foreground">{description}</div>
                    }
                    {customDetails && 
                        <div className="mt-2 text-xs">{customDetails}</div>
                    }
                </>
            )}
        </div>
    );
};