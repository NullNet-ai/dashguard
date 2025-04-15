"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { type ActivityLogProps } from "./types";
import { ActivityItem } from "./components/activity-item";

const SimpleActivityLog: React.FC<Omit<ActivityLogProps, 'variant' | 'onCommentClick'>> = ({
  activities,
  showTimestamp = true,
  timeFormat = "relative",
  absoluteTimeFormat = "MMM d, yyyy",
  className,
  itemClassName,
  customItemRenderer,
  commentButtonText,
  commentButtonClassName,
  showConnectingLines = true,
  lineGap = 4,
}) => {
  return (
    <div className={cn("space-y-4 relative", className)}>
      {showConnectingLines && activities.length > 1 && (
        <div className="absolute left-[10px] top-[12px] bottom-[12px] w-[0.5px] bg-gray-300 z-0" />
      )}
      
      {activities.map((activity) => {
        if (customItemRenderer) {
          return <div key={activity.id}>{customItemRenderer(activity)}</div>;
        }

        return (
          <ActivityItem
            key={activity.id}
            activity={activity}
            variant="simple"
            showTimestamp={showTimestamp}
            timeFormat={timeFormat}
            absoluteTimeFormat={absoluteTimeFormat}
            itemClassName={itemClassName}
            commentButtonText={commentButtonText}
            commentButtonClassName={commentButtonClassName}
            lineGap={lineGap}
          />
        );
      })}
    </div>
  );
};

const ListActivityLog: React.FC<Omit<ActivityLogProps, 'variant'>> = ({
  activities,
  showTimestamp = true,
  timeFormat = "relative",
  absoluteTimeFormat = "MMM d, yyyy",
  className,
  itemClassName,
  customItemRenderer,
  onCommentClick,
  commentButtonText,
  commentButtonClassName,
  showConnectingLines = true,
  lineGap = 4,
}) => {
  return (
    <div className={cn("space-y-4 relative", className)}>
      {showConnectingLines && activities.length > 1 && (
        <div className="absolute left-[10px] top-[12px] bottom-[12px] w-[0.5px] bg-gray-300 z-0" />
      )}
      
      {activities.map((activity) => {
        if (customItemRenderer) {
          return <div key={activity.id}>{customItemRenderer(activity)}</div>;
        }

        return (
          <ActivityItem
            key={activity.id}
            activity={activity}
            variant="list"
            showTimestamp={showTimestamp}
            timeFormat={timeFormat}
            absoluteTimeFormat={absoluteTimeFormat}
            itemClassName={itemClassName}
            onCommentClick={onCommentClick}
            commentButtonText={commentButtonText}
            commentButtonClassName={commentButtonClassName}
            lineGap={lineGap}
          />
        );
      })}
    </div>
  );
};

export const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  variant = "simple",
  showTimestamp = true,
  showUser = true,
  timeFormat = "relative",
  absoluteTimeFormat = "MMM d, yyyy",
  className,
  itemClassName,
  maxItems,
  emptyState = <div className="text-muted-foreground text-sm py-4">No activities to display</div>,
  customItemRenderer,
  onCommentClick,
  commentButtonText = "Comment",
  commentButtonClassName,
  showConnectingLines = true,
  ...props
}) => {
  // Filter activities based on maxItems
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  // Render empty state if no activities
  if (!displayedActivities.length) {
    return <div className={cn("activity-log", className)}>{emptyState}</div>;
  }

  switch (variant) {
    case "simple":
      return (
        <SimpleActivityLog
          activities={displayedActivities}
          showTimestamp={showTimestamp}
          showUser={showUser}
          timeFormat={timeFormat}
          absoluteTimeFormat={absoluteTimeFormat}
          className={className}
          itemClassName={itemClassName}
          customItemRenderer={customItemRenderer}
          commentButtonText={commentButtonText}
          commentButtonClassName={commentButtonClassName}
          showConnectingLines={showConnectingLines}
          {...props}
        />
      );
    case "list":
      return (
        <ListActivityLog
          activities={displayedActivities}
          showTimestamp={showTimestamp}
          showUser={showUser}
          timeFormat={timeFormat}
          absoluteTimeFormat={absoluteTimeFormat}
          className={className}
          itemClassName={itemClassName}
          customItemRenderer={customItemRenderer}
          onCommentClick={onCommentClick}
          commentButtonText={commentButtonText}
          commentButtonClassName={commentButtonClassName}
          showConnectingLines={showConnectingLines} 
          {...props}
        />
      );
    default:
      return (
        <SimpleActivityLog
          activities={displayedActivities}
          showTimestamp={showTimestamp}
          showUser={showUser}
          timeFormat={timeFormat}
          absoluteTimeFormat={absoluteTimeFormat}
          className={className}
          itemClassName={itemClassName}
          customItemRenderer={customItemRenderer}
          commentButtonText={commentButtonText}
          commentButtonClassName={commentButtonClassName}
          showConnectingLines={showConnectingLines} 
          {...props}
        />
      );
  }
};