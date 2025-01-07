"use server";

import { SortingState } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { headers } from "next/headers";

export async function UpdateReportSorting({
  sorting,
}: {
  sorting: {
    id: string;
    desc: boolean;
    sort_key?: string;
  }[];
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
 
  api.grid.updateReportSorting({
    sorting,
  });

  const sortingParams = sorting
    .map((item) => `${item.id}:${item.desc ? "desc" : "asc"}`) // Map each object to the desired string format
    .join("=");
  

  redirect(`${pathName}?sorting=${sortingParams}`);
}
