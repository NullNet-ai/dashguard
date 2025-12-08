"use server";

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { api } from "~/trpc/server";

export async function Delete({ entity, id }: { entity: string; id: string }) {
  const headerList = await headers();
  const fullUrl = headerList.get("x-full-pathname") || "";
  await api.grid.deleteRecord({
    entity,
    id,
  });
  revalidatePath(fullUrl)
}
