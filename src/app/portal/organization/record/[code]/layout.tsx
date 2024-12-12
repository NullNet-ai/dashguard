import React from "react";
import { notFound } from "next/navigation";
import PlatformRecord from "~/components/platform/RecordV2";
import { RecordSummaryViewContent } from "~/components/platform/RecordV2/Summary/SummaryViewContent";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordShellSummary from "../_components/RecordShellSummary";
import Options from "../_components/IdentifierOption";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier] = pathname.split("/");

  if (identifier === "new") {
    return notFound();
  }

  const organization_details = await api.organization.getByCode({
    code: identifier!,
    pluck_fields: [
      "code",
      "name",
      "categories",
      "status",
      "parent_organization_id",
      "created_by",
      "updated_by",
      "created_date",
      "created_time",
      "updated_date",
      "updated_time",
    ],
  });

  const { name, status } = organization_details?.data || {};

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
      id: "organization",
      name: "Organization",
      tabName: "organization",
    },
    {
      id: "sub-organization",
      name: "Sub-Organization",
      tabName: "sub-organization",
    },
    {
      id: "contact",
      name: "Contact",
      tabName: "contact",
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
        <RecordShellSummary name={name} />
      </RecordSummaryViewContent>
    </PlatformRecord>
  );
};

export default Layout;
