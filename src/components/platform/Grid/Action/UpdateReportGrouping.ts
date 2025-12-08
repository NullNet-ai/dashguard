'use server';

import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import type { IGroupBy } from '../Category/type';
import { revalidatePath } from 'next/cache';

export async function UpdateReportGrouping({
  grouping,
  gridKey,
}: {
  grouping: IGroupBy[];
  gridKey?: string;
}) {
  const headerList = await headers();
  const fullUrl = headerList.get("x-full-pathname") || "";

  await api.grid.updateReportGrouping({
    grouping,
    gridKey,
  });

  revalidatePath(fullUrl);
}
