"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { api } from "~/trpc/server";
import { ISearchItem } from "../Search/types";

export async function UpdateReportFilter({
  filters,
  filterItemId
}: {
  filters: ISearchItem[];
  filterItemId?: string;
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const urlSearchParams = new URLSearchParams(searchParams);
  console.log("🚀 ~ filters:", filters)
  await api.grid.updateReportFilter({
    filters,
  });
  revalidatePath(pathName);
  return `${pathName}?${urlSearchParams.toString()}`;
}
