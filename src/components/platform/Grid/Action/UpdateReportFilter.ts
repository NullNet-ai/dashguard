"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { api } from "~/trpc/server";
import { ISearchItem } from "../Search/types";

export async function UpdateReportFilter({
  filters,
  gridKey
}: {
  filters: ISearchItem[];
  gridKey?: string;
}) {
  const headerList = headers();
  const fullUrl = headerList.get("x-full-pathname") || "";
  await api.grid.updateReportFilter({
    filters,
    gridKey
  });
  revalidatePath(fullUrl)
  return fullUrl
}
