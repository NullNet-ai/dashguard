'use server';

import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import type { IGroupBy } from '../Category/type';
import { revalidatePath } from 'next/cache';

export async function UpdateReportGrouping({
  grouping,
  gridKey
}: {
  grouping: IGroupBy[];
  gridKey? : string
}) {
  const headerList = headers();
  const pathName = headerList.get('x-pathname') || '';
  const searchParams = headerList.get('x-full-search-query-params') || '';
  const urlSearchParams = new URLSearchParams(searchParams);

  await api.grid.updateReportGrouping({
    grouping,
    gridKey
  });

  const groupParams = grouping.map((item) => item.value).join(',');

  urlSearchParams.set('grouping', groupParams);
  revalidatePath(`${pathName}?${urlSearchParams}`)
  redirect(`${pathName}?${urlSearchParams}`);
}
