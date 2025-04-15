import React from "react";
import { cn } from "~/lib/utils";

interface PanelConnectorProps {
  className?: string;
  isLastStep?: boolean; // Add prop to check if this is the last step
}

export const PanelConnector = ({ className, isLastStep = false }: PanelConnectorProps) => {
  // Don't render the connector if this is the last step
  if (isLastStep) return null;
  
  return (
    <div className="absolute -right-[6.7px] top-1/2 -translate-y-1/2 z-10">
      <div className="bg-white">
        <div className={cn(
          "h-3 w-3 rotate-45 transform border-t border-r border-gray-300",
          className
        )}></div>
      </div>
    </div>
  );
};