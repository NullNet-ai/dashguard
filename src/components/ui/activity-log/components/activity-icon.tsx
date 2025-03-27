"use client";

import React from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import type { ActivityItem } from "../types";

export const ActivityIcon: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  if (activity.icon) return activity.icon;

  switch (activity.type) {
    case "applied":
      return <div className="h-2 w-2 rounded-full border border-gray-300" />;
    case "advanced":
      return <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
        <ChevronRightIcon className="h-3 w-3 text-white" />
      </div>;
    case "completed":
      return <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
        <CheckIcon className="h-3 w-3 text-white" />
      </div>;
    case "comment":
      return null;
    case "created":
      return <div className="h-2 w-2 rounded-full border border-gray-300" />;
    case "paid":
      return <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-xs text-white font-bold">$</span>
      </div>;
    default:
      return <div className="h-2 w-2 rounded-full border border-gray-300" />;
  }
};