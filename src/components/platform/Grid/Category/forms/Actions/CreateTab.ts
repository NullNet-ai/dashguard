"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function CreateTab({
  sort_by_direction,
  sort_by_field,
  filters,
  tabName,
}: {
  tabName: string;
  sort_by_field: string;
  sort_by_direction: "asc" | "desc" | "ascending" | "descending";
  filters: {
    id: string;
    type: "criteria" | "operator";
    field: string;
    operator: string;
    values: string[];
  }[];
}) {
  const { filter_id, mainEntity } = await api.grid.newGridTab({
    tabName,
  });

  await api.grid.saveFilters({ filter_id, filters });
  await api.grid.saveSorts({
    filter_id,
    sort_by_field,
    sort_by_direction,
  });

  //   await api.grid.saveSorts({
  //     filter_id,
  //     sort_by_field,
  //     sort_by_direction,
  //   });
  redirect(`/portal/${mainEntity}/grid?filter_id=${filter_id}`);
}
