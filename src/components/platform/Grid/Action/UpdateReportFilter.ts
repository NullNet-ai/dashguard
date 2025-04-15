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
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const fullUrl = headerList.get("x-full-pathname") || "";
  await api.grid.updateReportFilter({
    filters,
  });
  revalidatePath(fullUrl)
  return fullUrl
}
