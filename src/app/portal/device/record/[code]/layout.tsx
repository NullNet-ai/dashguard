import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordWrapper from "./_components/RecordWrapper";

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

  if (!main_entity || !identifier) {
    return notFound();
  }

  if (identifier === "new") {
    return notFound();
  }

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      "id",
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

  if (record_details?.errors?.length) {
    throw new Error(record_details.message as string);
  }
  if (!record_details?.data) {
    throw new Error("Record not found");
  }

  const { status } = record_details?.data || {};

  if (
    ["Draft", "draft", "Pending"].includes((status as string)?.toLowerCase())
  ) {
    return notFound();
  }

  return (
    <RecordWrapper
      record={record}
      record_summary={record_summary}
      entity_code={identifier!}
      entity_name={main_entity!}
    />
  );
};

export default Layout;
