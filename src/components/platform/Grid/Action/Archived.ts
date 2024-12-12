"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Archive({ entity, id }: { entity: string; id: string }) {
  await api.grid.archiveRecord({
    entity,
    id,
  });
  redirect(`/portal/${entity}/grid`);
}
