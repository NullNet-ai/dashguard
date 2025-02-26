"use client";
import moment from "moment";
import React from "react";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";



const getLastTwentyFourHoursTimeStamp = () => {
  const now = new Date();

  const last_hours = new Date(now);
  last_hours.setHours(now.getHours() - 24);
  const replace = (_date: Date) =>
    _date.toISOString().replace("T", " ").substring(0, 19) + "+00";

  const formattedNow = replace(now);
  const formattedLast24 = replace(last_hours);

  const result = [formattedLast24, formattedNow];

  return result;
};

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


export default function Connectivity({ device_id }: { device_id: string }) {
  const {
    data: record = [
      {
        hour: "",
        heartbeats: 0,
      },
    ],
  } = api.deviceHeartbeats.getLastHoursStatus.useQuery({
    device_id,
    time_range: getLastTwentyFourHoursTimeStamp(),
    timezone,
  });
  if (!device_id) return null;

  return (
    <div className="flex h-9 w-[170px] flex-row rounded-lg border border-gray-300">
      {record?.map((chart, index) => {
        const lastCls = index === record.length - 1 ? "rounded-r-md" : "";
        const firstCls = index === 0 ? "rounded-l-md" : "";

        return (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger className="h-full w-[calc(100%/24)]">
                <div
                  className={cn(
                    `h-full w-full`,
                    `${chart.heartbeats === 100 ? "bg-green-700" : "bg-transparent"}`,
                    lastCls,
                    firstCls,
                  )}
                ></div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex flex-col gap-y-1">
                  <span className="font-semibold">{moment(chart.hour).format("MM/DD HH:mm")}</span>
                  <div>
                    Heartbeats:{" "}
                    <span className="font-semibold">{chart.heartbeats === 100 ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}