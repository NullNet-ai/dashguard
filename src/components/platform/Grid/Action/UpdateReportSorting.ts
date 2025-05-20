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
    is_case_sensitive_sorting?: boolean;
  }[];
  gridKey?: string;
}) {
  const headerList = headers();
  const fullUrl = headerList.get("x-full-pathname") || "";

  await api.grid.updateReportSorting({
    sorting,
    gridKey
  });

  revalidatePath(fullUrl)
}
