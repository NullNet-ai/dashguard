
import type React from "react";

export interface ActivityItem {
  id: string;
  type: "applied" | "advanced" | "completed" | "comment" | "comment-form"| "created" | "paid" | "assigned" | "tagged" | "custom";
  description?: string;
  timestamp: Date | string;
  user: {
    name: string;
    avatar?: string;
    avatarFallback?: string;
  };
  icon?: React.ReactNode;
  status?: "success" | "error" | "warning" | "info" | "default";
  customContent?: React.ReactNode | ((props: any) => React.ReactNode);
  comment?: string;
  target?: string;
  action?: string;
  attachIcon?: React.ReactNode;
  emoji?: React.ReactNode;
  hideTimestamp?: boolean;
}

// Add lineGap to the ActivityLogProps interface
export interface ActivityLogProps {
  activities: ActivityItem[];
  variant?: "simple" | "list";
  showTimestamp?: boolean;
  showUser?: boolean;
  timeFormat?: "relative" | "absolute";
  absoluteTimeFormat?: string;
  className?: string;
  itemClassName?: string;
  maxItems?: number;
  emptyState?: React.ReactNode;
  customItemRenderer?: (item: ActivityItem) => React.ReactNode;
  onCommentClick?: (activityId: string) => void;
  commentButtonText?: string;
  commentButtonClassName?: string;
  showConnectingLines?: boolean;
  lineGap?: number; // New prop for configuring the gap size
}