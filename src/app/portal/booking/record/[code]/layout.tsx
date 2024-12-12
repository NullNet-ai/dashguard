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

  const fetch_booking = await api.record.getById({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "code",
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

  const { status, code } = fetch_booking?.data || {};

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
      id: "booking",
      name: "Booking",
      tabName: "booking",
    },
    {
      id: "contact",
      name: "Contact",
      tabName: "contact",
    },
    {
      id: "feedback",
      name: "Feedback",
      tabName: "feedback",
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
        <RecordShellSummary code={code} />
      </RecordSummaryViewContent>
    </PlatformRecord>
  );
};

export default Layout;
