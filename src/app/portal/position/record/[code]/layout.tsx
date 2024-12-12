import React from "react";
import { notFound } from "next/navigation";
import PlatformRecord from "~/components/platform/RecordV2";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { RecordSummaryViewContent } from "~/components/platform/RecordV2/Summary/SummaryViewContent";
import RecordShellSummary from "../_components/RecordShellSummary";
import Options from "../_components/IdentifierOption";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier] = pathname.split("/");

  if (identifier === "new") {
    return notFound();
  }

  const position_details = await api.position.getByCode({
    code: identifier!,
    pluck_fields: [
      "code",
      "title",
      "status",
      "created_by",
      "updated_by",
      "created_date",
      "created_time",
      "updated_date",
      "updated_time",
    ],
  });

  const { title, status } = position_details?.data || {};

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
      id: "position",
      name: "Position",
      tabName: "position",
    },
    {
      id: "contact",
      name: "Contact",
      tabName: "contact",
    },
    {
      id: "booking",
      name: "Booking",
      tabName: "booking",
    },
  ];

  return (
    <PlatformRecord
      config={{
        entityCode: identifier!,
        entityName: mainEntity,
        tabs: tabs,
        identifierOption: Options,
      }}
    >
      {children}
      <RecordSummaryViewContent>
        <RecordShellSummary title={title} />
      </RecordSummaryViewContent>
    </PlatformRecord>
  );
};

export default Layout;
