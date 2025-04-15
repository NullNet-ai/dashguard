"use client";

import React from "react";
import type { ActivityItem } from "../types";
import { ActivityDescription } from "./activity-description";

export const StandardContent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  return (
    <div className="text-sm">
      <span className="font-medium">{activity.user.name}</span>{" "}
      <ActivityDescription activity={activity} />
    </div>
  );
};