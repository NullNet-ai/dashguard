"use server";

import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export async function BulkArchive({ entity, record_ids }: { entity: string; record_ids: string[] }) {
  await api.grid.archiveBulkRecord({
    entity,
    record_ids,
  });
  redirect(`/portal/${entity}/grid`);
}
