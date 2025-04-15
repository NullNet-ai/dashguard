"use client";

import React from "react";
import type { ActivityItem } from "../types";

export const ActivityDescription: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  if (activity.description) return <>{activity.description}</>;

  switch (activity.type) {
    case "applied":
      return <>Applied to <span className="font-medium">{activity.target}</span></>;
    case "advanced":
      return <>Advanced to phone screening by <span className="font-medium">{activity.user.name}</span></>;
    case "completed":
      return <>Complete phone screening with <span className="font-medium">{activity.user.name}</span></>;
    case "comment":
      return <>commented</>;
    case "created":
      return <>created the invoice.</>;
    case "paid":
      return <>paid the invoice.</>;
    case "assigned":
      return <>assigned <span className="font-medium">{activity.target}</span></>;
    case "tagged":
      return <>added tags</>;
    default:
      return <>{activity.action || "performed an action"}</>;
  }
};