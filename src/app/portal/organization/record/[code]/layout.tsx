import React from "react";
import { notFound } from "next/navigation";
import PlatformRecord from "~/components/platform/RecordV2";
import { RecordSummaryViewContent } from "~/components/platform/RecordV2/Summary/SummaryViewContent";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordShellSummary from "../_components/RecordShellSummary";
import Options from "../_components/IdentifierOption";
import { IPlatformRecordLayoutProps } from "~/components/platform/RecordV2/types";
import RecordWrapper from "~/components/platform/RecordV2/RecordWrapper";

const Layout = async ({ children, record, record_summary }: IPlatformRecordLayoutProps) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

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
      id: "suborganizations",
      name: "Sub-Organizations",
      tabName: "suborganizations",
    },
    {
      id: "contact",
      name: "Contact",
      tabName: "contact",
    },
  ];

  return (
    <RecordWrapper
      record={record}
      record_summary={record_summary}
      tabs={tabs}
      customProps={{
        config: {
          entityCode: identifier!,
          entityName: main_entity!,
        },
      }}
    />
  );
};

export default Layout;
