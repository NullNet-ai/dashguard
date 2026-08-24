import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

import RecordWrapper from '~/components/platform/Record/RecordWrapper'
import { api } from '~/trpc/server'
import tabs from '../_config/tabs';
import RecordSummaryPage from './_record_summary';
import ContentLoading from './loading';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, , identifier] = pathname.split('/')

  const record_details = await api.deviceGroup.getByCode({
    
    code: identifier!,
    pluck_fields: [
      'code',
      'name',
      'categories',
      'status',
      'created_by',
      'updated_by',
      'created_date',
      'created_time',
      'updated_date',
      'updated_time',
    ],
  })
  if (record_details?.errors?.length || !record_details?.data) {
    return notFound()
  }

  const { status } = record_details?.data || {}

  // Record Shell Guard for Draft Records
  if (status.toLowerCase() === 'draft') {
    return notFound()
  }

  return (
    <RecordWrapper
      customProps={{
        config: {
          entityCode: identifier!,
          entityName: main_entity!,
        },
      }}
      record={<Suspense fallback={<ContentLoading />}>{children}</Suspense>}
      record_summary={
        <Suspense fallback={<ContentLoading />}>
          <RecordSummaryPage />
        </Suspense>
      }
      tabs={tabs}
    />
  )
}

export const dynamic = 'force-dynamic'

export default Layout
