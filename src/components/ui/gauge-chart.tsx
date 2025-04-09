"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

export interface GaugeChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  items?: {
    primary: { label: string; value: number };
    secondary: { label: string; value: number };
  };
}

export function GaugeChart({
  percentage,
  size = 150,
  strokeWidth = 12,
  primaryColor = "rgb(96, 165, 250)", // blue-400
  secondaryColor = "rgb(226, 232, 240)", // slate-200
  className,
  items,
}: GaugeChartProps) {
  // Calculate the circumference of the circle
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // We only want to show a semi-circle (180 degrees), so we use half the circumference
  const halfCircumference = circumference / 2;
  
  // Calculate the arc length based on the percentage
  const arcLength = (percentage / 100) * halfCircumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size / 2 }}>
        {/* Percentage in the middle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-gray-700">{percentage}%</span>
        </div>
        
        {/* SVG for the gauge */}
        <svg width={size} height={size / 2} className="overflow-visible">
          {/* Background arc (secondary color) */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
          
          {/* Foreground arc (primary color) */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={halfCircumference}
            strokeDashoffset={halfCircumference - arcLength}
          />
        </svg>
      </div>
      
      {/* Legend items */}
      {items && (
        <div className="mt-4 grid w-full grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: primaryColor }} />
            <span className="text-sm text-gray-700">{items.primary.label}</span>
            <span className="ml-auto text-sm text-gray-500">{items.primary.value}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: secondaryColor }} />
            <span className="text-sm text-gray-700">{items.secondary.label}</span>
            <span className="ml-auto text-sm text-gray-500">{items.secondary.value}</span>
          </div>
        </div>
      )}
    </div>
  );
}