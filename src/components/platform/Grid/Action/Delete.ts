"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Delete({ entity, id }: { entity: string; id: string }) {
  await api.grid.deleteRecord({
    entity,
    id,
  });
  redirect(`/portal/${entity}/grid`);
}
