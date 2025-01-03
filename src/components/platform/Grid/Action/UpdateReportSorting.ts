"use server";

import { SortingState } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { headers } from "next/headers";

export async function UpdateReportSorting({
  entity,
  sorting,
}: {
  entity: string;
  sorting: {
    id: string;
    desc: boolean;
    sort_key?: string;
  }[];
}) {
  const headerList = headers();
  const gridTabId = headerList.get("x-grid-tab-id") || "";
 
  api.grid.updateReportSorting({
    sorting,
  });

  const sortingParams = sorting
    .map((item) => `${item.id}:${item.desc ? "desc" : "asc"}`) // Map each object to the desired string format
    .join("=");
  
  if(!sorting.length) {
    redirect(`/portal/${entity}/grid/${gridTabId ? `?filter_id=${gridTabId}` : ""}`);
  }

  redirect(`/portal/${entity}/grid/${gridTabId ? `?filter_id=${gridTabId}&&` : "?"}sorting=${sortingParams}`);
}
