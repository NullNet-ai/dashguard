import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { type IPlatformRecordLayoutProps } from '~/components/platform/Record/types'
import { api } from '~/trpc/server'

import RecordWrapper from './_components/RecordWrapper'

const Layout = async ({
  record,
  record_summary,
}: IPlatformRecordLayoutProps) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, , identifier] = pathname.split('/')

  if (identifier === 'new') {
    return notFound()
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
  })

  if (organization_details?.errors?.length || !organization_details?.data) {
    return notFound()
  }

  const { status } = organization_details?.data || {}

  // Record Shell Guard for Draft Records
  if (typeof status === 'string' && status.toLowerCase() === 'draft') {
    return notFound()
  }

  return (
    <RecordWrapper
      entity_code={identifier!}
      entity_name={main_entity!}
      record={record}
      record_summary={record_summary}
    />
  )
}

export default Layout
