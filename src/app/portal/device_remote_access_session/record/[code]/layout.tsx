import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';

import RecordWrapper from './_components/RecordWrapper';
import { api } from '~/trpc/server';
import RecordSummaryPage from './_record_summary';
import ContentLoading from './loading';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');

  if (!main_entity || !identifier) {
    return notFound();
  }

  if (identifier === 'new') {
    return notFound();
  }

  const record_details = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: [
      'id',
      'code',
      'categories',
      'status',
      'created_by',
      'updated_by',
      'created_date',
      'created_time',
      'updated_date',
      'updated_time',
    ],
  });

  if (record_details?.status_code === 404) {
    return notFound();
  }

  if (record_details?.errors?.length) {
    console.error(record_details.message);
    throw new Error(record_details.message as string);
  }
  if (!record_details?.data) {
    return notFound();
  }

  const { status } = record_details?.data || {};

  if (
    ['Draft', 'draft', 'Pending'].includes((status as string)?.toLowerCase())
  ) {
    return notFound();
  }

  return (
    <RecordWrapper
      entity_code={identifier!}
      entity_name={main_entity!}
      record={<Suspense fallback={<ContentLoading />}>{children}</Suspense>}
      record_summary={
        <Suspense fallback={<ContentLoading />}>
          <RecordSummaryPage />
        </Suspense>
      }
    />
  );
};

export default Layout;
