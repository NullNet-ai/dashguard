'use server';

import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function UpdateReportPagination({
  pagination,
  gridKey,
}: {
  pagination: {
    current_page: number;
    limit_per_page: number;
  };
  gridKey?: string;
}) {
  const headerList = await headers();
  const fullUrl = headerList.get("x-full-pathname") || "";

  await api.grid.updateReportPagination({
    pagination,
    gridKey,
  });

  revalidatePath(fullUrl)
}
