"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  await api.grid.updateReportFilter({
    filters,
  });

  urlSearchParams.set("advanceFilterItem", filterItemId || "");

  redirect(`${pathName}?${urlSearchParams}`);
}
