"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { ActivityItem } from "../types";
import { ActivityIcon } from "./activity-icon";

export const ActivityIndicator: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  return (
    <div className="flex-shrink-0">
      {activity.type === "comment" ? (
        <Avatar className="size-5">
          {activity.user.avatar && (
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
          )}
          <AvatarFallback className="text-[10px]">
            {activity.user.avatarFallback || activity.user.name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-5 w-5 flex items-center justify-center">
          <ActivityIcon activity={activity} />
        </div>
      )}
    </div>
  );
};