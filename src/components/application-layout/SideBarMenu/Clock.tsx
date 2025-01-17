/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useSidebar } from "~/components/ui/sidebar";
const Clock = () => {
  const [date, setDate] = useState<Date>(new Date());

  let interval: any = null;

  useEffect(() => {
    setDate(new Date());
    interval = setInterval(() => {
      setDate(new Date());
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { open, openMobile } = useSidebar();

  return (
    <div
      className={`grid flex-1 px-2 text-right text-sm leading-tight ${(!openMobile && !open) && "hidden"}`}
    >
      {date ? (
        <span className="mr-4 ms-auto truncate px-2 py-[2px] font-semibold">
          {moment(date).format("HH:mm")}
        </span>
      ) : (
        <span className="mr-4 ms-auto truncate px-2 py-[2px] font-semibold">
          --:-- --
        </span>
      )}
      <span className="mr-4 ms-auto truncate rounded-lg border border-gray-100 bg-yellow-50 px-2 py-[2px] text-xs text-yellow-600">
        {timezone ? timezone : "--/--"}
      </span>
    </div>
  );
};

export default Clock;
