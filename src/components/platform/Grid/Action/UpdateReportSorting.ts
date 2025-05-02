"use server";

import { SortingState } from "@tanstack/react-table";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';

export async function UpdateReportSorting({
  sorting,
  gridKey
}: {
  sorting: {
    id: string;
    desc: boolean;
    sort_key?: string;
  }[];
  gridKey?: string;
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const urlSearchParams = new URLSearchParams(searchParams);

  await api.grid.updateReportSorting({
    sorting,
    gridKey
  });

  const sortingParams = sorting
    .map((item) => `${item.id}:${item.desc ? "desc" : "asc"}`) // Map each object to the desired string format
    .join("=");

  urlSearchParams.set("sorting", sortingParams);

  revalidatePath(`${pathName}?${urlSearchParams}`)
  redirect(`${pathName}?${urlSearchParams}`);
}
