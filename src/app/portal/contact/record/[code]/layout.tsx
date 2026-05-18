import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

import { api } from '~/trpc/server'
import ContentLoading from './loading';
import RecordWrapper from './_components/RecordWrapper'
import RecordSummaryPage from './_record_summary';


const Layout = async ({ children }: { children: React.ReactNode }) => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, , identifier] = pathname.split('/')

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
  })
  if (record_details?.errors?.length) {
    throw new Error(record_details.message as string)
  }
  if (!record_details?.data) {
    throw new Error('Record not found')
  }

  const { status, categories } = record_details?.data || {}

  // Record Shell Guard for Draft Records
  if (status.toLowerCase() === 'draft') {
    return notFound()
  }

  const is_applicant = categories?.includes('Applicant')

  return (
    <RecordWrapper
      entity_code={identifier!}
      entity_name={main_entity!}
      is_applicant={is_applicant}
      record={<Suspense fallback={<ContentLoading />}>{children}</Suspense>}
      record_summary={
        <Suspense fallback={<ContentLoading />}>
          <RecordSummaryPage />
        </Suspense>
      }
    />
  )
}

export default Layout
