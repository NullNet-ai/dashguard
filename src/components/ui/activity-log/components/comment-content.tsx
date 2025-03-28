"use client";

import React from "react";
import type { ActivityItem } from "../types";
import { ActivityDescription } from "./activity-description";

export const CommentContent: React.FC<{ 
  activity: ActivityItem;
  showHeader?: boolean;
  showDescription?: boolean;
  showComment?: boolean;
}> = ({ 
  activity, 
  showHeader = true, 
  showDescription = true,
  showComment = true 
}) => {
  // If nothing is shown, return null to allow custom content to shift up
  if (!showHeader && !showComment) {
    return null;
  }
  
  return (
    <>
      {showHeader && (
        <div className="flex items-center gap-1">
          <span className="font-medium">{activity.user.name}</span>
          {showDescription && (
            <span className="text-sm text-muted-foreground">
              <ActivityDescription activity={activity} />
            </span>
          )}
        </div>
      )}
      {showComment && activity.comment && (
        <div className="mt-1 text-sm">
          {activity.comment}
        </div>
      )}
    </>
  );
};