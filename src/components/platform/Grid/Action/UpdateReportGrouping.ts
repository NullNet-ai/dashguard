"use server";

import { SortingState } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import { IGroupBy } from '../Category/type';

export async function UpdateReportGrouping({
  grouping,
}: {
  grouping: IGroupBy[]
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const urlSearchParams = new URLSearchParams(searchParams);

  api.grid.updateReportGrouping({
    grouping,
  });

  const groupParams = grouping.map((item) => item.value).join(",");
   
  urlSearchParams.set("grouping", groupParams);

  redirect(`${pathName}?${urlSearchParams}`);
}
