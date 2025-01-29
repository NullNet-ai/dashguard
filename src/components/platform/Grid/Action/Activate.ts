"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function Activate({ entity, id }: { entity: string; id: string }) {
  await api.grid.activateRecord({
    entity,
    id,
  });
  redirect(`/portal/${entity}/grid`);
}