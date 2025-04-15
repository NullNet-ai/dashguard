"use client";

import React from "react";
import { format } from "date-fns";

export const ActivityTimestamp: React.FC<{
  timestamp: Date | string;
  timeFormat: "relative" | "absolute";
  absoluteTimeFormat: string;
}> = ({ timestamp, timeFormat, absoluteTimeFormat }) => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  // For relative time, use a custom format that's more concise
  if (timeFormat === "relative") {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    // If more than 7 days ago, show the date in MMM d format
    if (diffInDays > 7) {
      return (
        <div className="text-xs text-muted-foreground">
          {format(date, "MMM d")}
        </div>
      );
    }

    // If within last week, show relative time in a concise format
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    let formattedTime;
    if (diffInDays > 0) {
      formattedTime = `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      formattedTime = `${diffInHours}h ago`;
    } else if (diffInMinutes > 0) {
      formattedTime = `${diffInMinutes}min ago`;
    } else {
      formattedTime = 'just now';
    }

    return (
      <div className="text-xs text-muted-foreground">
        {formattedTime}
      </div>
    );
  }

  // For absolute time, use the provided format
  return (
    <div className="text-xs text-muted-foreground">
      {format(date, absoluteTimeFormat)}
    </div>
  );
};