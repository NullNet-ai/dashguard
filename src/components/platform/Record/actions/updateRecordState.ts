"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function updateRecordState({
  identifier,
  entity,
  status,
}: {
  identifier: string;
  entity: string;
  status: string;
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const urlSearchParams = new URLSearchParams(searchParams);
  await api.record.updateRecordState({ entity, identifier, status });
  urlSearchParams.set("statusUpdated", `${status}`);
  redirect(`${pathName}?${urlSearchParams}`);
}
