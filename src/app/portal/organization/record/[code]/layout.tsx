import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { api } from '~/trpc/server';
import RecordWrapper from './_components/RecordWrapper';
import { Suspense } from 'react';
import RecordSummaryPage from './_record_summary';
import ContentLoading from './loading';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , main_entity, , identifier] = pathname.split('/');

  if (identifier === 'new') {
    return notFound();
  }

  const organization_details = await api.organization.getByCode({
    code: identifier!,
    pluck_fields: [
      'code',
      'name',
      'categories',
      'status',
      'parent_organization_id',
      'created_by',
      'updated_by',
      'created_date',
      'created_time',
      'updated_date',
      'updated_time',
    ],
  });

  if (organization_details?.errors?.length || !organization_details?.data) {
    return notFound();
  }

  const { status } = organization_details?.data || {};

  // Record Shell Guard for Draft Records
  if (typeof status === 'string' && status.toLowerCase() === 'draft') {
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
