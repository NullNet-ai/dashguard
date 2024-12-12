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
  const [, , mainEntity, , identifier] = pathname.split("/");

  if (identifier === "new") {
    return notFound();
  }

  const position_types_details = await api.record.getByCode({
    main_entity: "position_type",
    id: identifier!,
    pluck_fields: [
      "code",
      "position_type",
      "status",
      "created_by",
      "updated_by",
      "created_date",
      "created_time",
      "updated_date",
      "updated_time",
    ],
  });

  const { position_type, status } = position_types_details?.data || {};

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
      id: "position_type",
      name: "Position Type",
      tabName: "position_type",
    },
  ];

  return (
    <PlatformRecord
      config={{
        entityCode: identifier!,
        entityName: mainEntity,
        tabs: tabs,
      }}
    >
      {children}
      <RecordSummaryViewContent>
        <RecordShellSummary position_type={position_type} />
      </RecordSummaryViewContent>
    </PlatformRecord>
  );
};

export default Layout;
