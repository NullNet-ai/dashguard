import React from "react";
import { notFound } from "next/navigation";
import PlatformRecord from "~/components/platform/RecordV2";
import { RecordSummaryViewContent } from "~/components/platform/RecordV2/Summary/SummaryViewContent";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordShellSummary from "../_components/RecordShellSummary";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  if (identifier === "new") {
    return notFound();
  }

  const fetch_employment_type = await api.record.getById({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "code",
      "employment_type",
      "categories",
      "status",
      "created_by",
      "updated_by",
      "created_date",
      "created_time",
      "updated_date",
      "updated_time",
    ],
  });

  const { employment_type, status } = fetch_employment_type?.data || {};

  //Record Shell Guard for Draft Records
  if (status === "draft") {
    return notFound();
  }

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      tabName: "dashboard",
    },
    {
      id: "employment_type",
      name: "Employment Type",
      tabName: "employment_type",
    },
  ];

  return (
    <PlatformRecord
      config={{
        entityCode: identifier!,
        entityName: main_entity,
        tabs: tabs,
      }}
    >
      {children}
      <RecordSummaryViewContent>
        <RecordShellSummary employment_type={employment_type} />
      </RecordSummaryViewContent>
    </PlatformRecord>
  );
};

export default Layout;
