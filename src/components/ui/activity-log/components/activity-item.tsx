"use client";

import React from "react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import type { ActivityItem as ActivityItemType } from "../types";
import { ActivityIndicator } from "./activity-indicator";
import { StandardContent } from "./standard-content";
import { CommentContent } from "./comment-content";

export const ActivityItem: React.FC<{
  activity: ActivityItemType;
  variant: "simple" | "list";
  showTimestamp: boolean;
  timeFormat: "relative" | "absolute";
  absoluteTimeFormat: string;
  itemClassName?: string;
  onCommentClick?: (activityId: string) => void;
  commentButtonText?: string;
  commentButtonClassName?: string;
  lineGap?: number;
}> = ({
  activity,
  variant,
  showTimestamp,
  timeFormat,
  absoluteTimeFormat,
  itemClassName,
  onCommentClick,
  commentButtonText = "Comment",
  commentButtonClassName,
  lineGap = 4,
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 relative",
        itemClassName
      )}
    >
      <div className="flex-shrink-0 relative z-10 pt-0.5">
        <div 
          className="absolute bg-white rounded-full z-0" 
          style={{ 
            width: `${lineGap * 2 + 20}px`, 
            height: `${lineGap * 2 + 20}px`,
            top: `${-lineGap}px`,
            left: `${-lineGap - 7.5}px`
          }}
        />
        
        <div className="relative z-10">
          <ActivityIndicator activity={activity} />
        </div>
        
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div className="text-sm">
            
                {
                  activity.type === "comment" ? (
                    <CommentContent
                      activity={activity}
                      showHeader={activity.customContent ? false : true}
                      showDescription={activity.customContent ? false : true}
                      showComment={activity.customContent ? false : true}
                    />
                  ) : (
                    <StandardContent activity={activity} />
                  )
                }
            </div>

            {showTimestamp && !activity.hideTimestamp && (
              <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                {(() => {
                  const date = typeof activity.timestamp === "string" ? new Date(activity.timestamp) : activity.timestamp;
                  
                  if (timeFormat === "relative") {
                    const now = new Date();
                    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                    // If more than 7 days ago, show the date in MMM d format
                    if (diffInDays > 7) {
                      return format(date, "MMM d");
                    }

                    // If within last week, show relative time in a concise format
                    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

                    if (diffInDays > 0) {
                      return `${diffInDays}d ago`;
                    } else if (diffInHours > 0) {
                      return `${diffInHours}h ago`;
                    } else if (diffInMinutes > 0) {
                      return `${diffInMinutes}min ago`;
                    } else {
                      return 'just now';
                    }
                  }

                  return format(date, absoluteTimeFormat);
                })()}
              </div>
            )}
          </div>

          {activity.customContent && (
            <div>
              {typeof activity.customContent === 'function'
                ? (activity.customContent as (props: any) => React.ReactNode)({
                  showHeader: true,
                  showFooter: variant === "list",
                  showTimestamp: showTimestamp,
                  attachIcon: activity.attachIcon,
                  emoji: activity.emoji,
                })
                : activity.customContent}
            </div>
          )}
        </div>
      </div>

      {/* Comment button for non-comment activities */}
      {variant === "list" && activity.type !== "comment" && onCommentClick && (
        <button
          onClick={() => onCommentClick(activity.id)}
          className={cn(
            "text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50",
            commentButtonClassName
          )}
        >
          {commentButtonText}
        </button>
      )}
    </div>
  );
};