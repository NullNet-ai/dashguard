"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { headers } from "next/headers";

export async function UpdateReportPagination({
  current_page,
  limit_per_page,
}: {
  current_page: number;
  limit_per_page: number;
}) {
  const headerList = headers();
  const pathName = headerList.get("x-pathname") || "";
  const searchParams = headerList.get("x-full-search-query-params") || "";
  const urlSearchParams = new URLSearchParams(searchParams);

  api.grid.updateReportPagination({
    current_page,
    limit_per_page,
  });
  urlSearchParams.set("pagination", `page=${current_page}&perPage=${limit_per_page}`);
  redirect(`${pathName}?${urlSearchParams}`);
}
