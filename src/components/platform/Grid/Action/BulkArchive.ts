"use server";

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { api } from "~/trpc/server";

export async function BulkArchive({ entity, record_ids }: { entity: string; record_ids: string[] }) {
  const headerList = await headers();
  const fullUrl = headerList.get("x-full-pathname") || "";
  await api.grid.archiveBulkRecord({
    entity,
    record_ids,
  });
  revalidatePath(fullUrl)
}
