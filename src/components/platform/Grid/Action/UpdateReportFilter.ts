"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { ISearchItem } from "../Search/types";

export async function UpdateReportFilter({
  filters,
}: {
  filters: ISearchItem[];
}) {
 
  await api.grid.updateReportFilter({
    filters,
  });
}
