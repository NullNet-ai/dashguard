import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordWrapper from "~/components/platform/Record/RecordWrapper";

const Layout = async ({
  record,
  record_summary,
}: {
  record: React.ReactNode;
  record_summary: React.ReactNode;
  children: React.ReactNode;
}) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier] = pathname.split("/");

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "code",
      "role",
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
  if (record_details?.errors?.length) {
    throw new Error(record_details.message as string);
  }
  if (!record_details?.data) {
    throw new Error("Record not found");
  }

  const { status } = record_details?.data || {};

  //Record Shell Guard for Draft Records
  if (status === "draft") {
    return notFound();
  }

  //Record Shell Guard for Draft Records
  if (["Draft", "draft", "Pending"].includes(status)) {
    return notFound();
  }

  const tabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      tabName: "dashboard",
    },
    {
      id: "user_role",
      name: "Role",
      tabName: "user_role",
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
