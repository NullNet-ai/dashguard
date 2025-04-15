"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type ProgressSegment = {
  label: string;
  value: number;
  color: string;
};

export interface ProgressBarWithTooltipsProps {
  segments: ProgressSegment[];
  className?: string;
  height?: string;
  showLabels?: boolean;
  showTooltips?: boolean;
  rounded?: boolean;
  minSegmentWidth?: string; // New prop for minimum segment width
}

export function ProgressBarWithTooltips({
  segments,
  className,
  height = "h-2",
  showLabels = false,
  showTooltips = true,
  rounded = true,
  minSegmentWidth = "4px", // Default minimum width
}: ProgressBarWithTooltipsProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("w-full", className)}>
        <div className={cn("w-full overflow-hidden rounded-sm", height, rounded && "rounded-full")}>
          <div className="flex h-full w-full">
            {segments.map((segment, index) => {
              const percentage = (segment.value / total) * 100;
              
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn("h-full transition-all", segment.color)}
                      style={{ 
                        width: `${percentage}%`, 
                        minWidth: segment.value > 0 ? minSegmentWidth : '0px' 
                      }}
                    />
                  </TooltipTrigger>
                  {showTooltips && (
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", segment.color)} />
                        <span>
                          {segment.label} ({segment.value})
                        </span>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
        
        {showLabels && (
          <div className="mt-2 flex flex-wrap gap-4">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", segment.color)} />
                <span className="text-xs text-gray-600">
                  {segment.label} ({segment.value})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}