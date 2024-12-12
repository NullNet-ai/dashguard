"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveFilters({
  filter_id,
  filters,
  mainEntity,
}: {
  filter_id: string;
  mainEntity: string;
  filters: {
    id: string;
    type: "criteria" | "operator";
    field: string;
    operator: string;
    values: string[];
  }[];
}) {
  await api.grid.saveFilters({ filter_id, filters });
  redirect(`/portal/${mainEntity}/grid?filter_id=${filter_id}`);
}
