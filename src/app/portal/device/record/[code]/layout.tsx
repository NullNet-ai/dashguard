import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import RecordWrapper from "./_components/RecordWrapper";
import ContentLoading from './loading'
import RecordSummaryPage from './_record_summary';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = await headers();
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
    entity_code={identifier!}
    entity_name={main_entity!}
    record={<Suspense fallback={<ContentLoading />}>{children}</Suspense>}
    record_summary={
      <Suspense fallback={<ContentLoading />}>
        <RecordSummaryPage />
      </Suspense>
    }
  />
  );
};

export default Layout;
