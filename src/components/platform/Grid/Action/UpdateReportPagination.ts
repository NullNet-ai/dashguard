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
  const headerList = headers();
  const pathName = headerList.get('x-pathname') || '';
  const searchParams = headerList.get('x-full-search-query-params') || '';
  const urlSearchParams = new URLSearchParams(searchParams);

  await api.grid.updateReportPagination({
    pagination,
    gridKey,
  });
  urlSearchParams.set(
    'pagination',
    `page=${pagination.current_page}&perPage=${pagination.limit_per_page}`,
  );

  revalidatePath(`${pathName}?${urlSearchParams}`)
  redirect(`${pathName}?${urlSearchParams}`);
}
