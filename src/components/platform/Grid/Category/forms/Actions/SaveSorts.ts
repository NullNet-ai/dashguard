"use server";

// import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function SaveSorts({
  sort_by_direction,
  sort_by_field,
  filter_id,
}: {
  sort_by_field: string;
  sort_by_direction: "asc" | "desc" | "ascending" | "descending";
  filter_id: string;
}) {
  await api.grid.saveSorts({
    filter_id,
    sort_by_field,
    sort_by_direction,
  });
  //   redirect(`/portal/${mainEntity}/grid?filter_id=${filter_id}`);
}
