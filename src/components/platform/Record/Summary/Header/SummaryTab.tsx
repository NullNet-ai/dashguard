"use client";

import {
  FileIcon,
  LayoutDashboardIcon,
  MonitorStopIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";
import SummaryTab from "../../Tabs/SummaryTab";

const summaryTabs = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboardIcon,
    current: true,
  },
  // {
  //   id: "tag",
  //   name: "Tag",
  //   icon: TagIcon,
  //   current: false,
  // },
  // {
  //   id: "file",
  //   name: "File",
  //   icon: FileIcon,
  //   current: false,
  // },
  // {
  //   id: "status",
  //   name: "Status",
  //   icon: MonitorStopIcon,
  //   current: false,
  // },
];

export default function SummaryRecordTab() {
  const [sumTabs, setSumTabs] = useState(summaryTabs);

  return (
    <div className="border-b border-slate-300 p-2 px-4 pb-0">
      <SummaryTab
        tabs={sumTabs}
        onTabChanged={(tab) => {
          setSumTabs(
            sumTabs.map((item) => {
              return {
                ...item,
                current: item.id === tab.id,
              };
            }),
          );
        }}
      />
    </div>
  );
}
