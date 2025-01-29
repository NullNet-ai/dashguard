"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Restore({ entity, id }: { entity: string; id: string }) {
  await api.grid.restoreRecord({
    entity,
    id,
  });
  redirect(`/portal/${entity}/grid`);
}
