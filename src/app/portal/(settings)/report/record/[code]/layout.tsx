import React from "react";
import { notFound } from "next/navigation";
import PlatformRecord from "~/components/platform/RecordV2";
import { headers } from "next/headers";
import { api } from "~/trpc/server";

// import type { TProps } from "./types";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  const record = await api.record.getByCode({
    id: identifier!,
    main_entity: main_entity!,
    pluck_fields: ["id", "code"],
  });

  const { categories } = record?.data ?? {};

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      tabName: "dashboard",
    },
    {
      id: "report",
      name: "Report",
      tabName: "reports",
    },
    {
      id: "column",
      name: "Column",
      tabName: "column",
    },
    {
      id: "filters",
      name: "Filters",
      tabName: "filters",
    },
    {
      id: "groups",
      name: "Groups",
      tabName: "groups",
    },
  ];

  return (
    <PlatformRecord
      config={{
        entityCode: identifier!,
        entityName: main_entity!,
        tabs: tabs,
        categories: categories,
      }}
    >
      {children}
      {/* <RecordSummaryViewContent>
        <div className="">HALLO</div>
      </RecordSummaryViewContent> */}
    </PlatformRecord>
  );
};

export default Layout;
