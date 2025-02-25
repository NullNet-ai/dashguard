'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

const handleChangeStatus = async (
  record_status: string,
  recordId: string,
  entityName: string,
  field_key: string,
) => {
  const headerList = headers()
  const pathName = headerList.get('x-pathname') || ''
  await api.record.updateRecordStatus({
    id: recordId,
    record_status,
    entity: entityName,
    field_key,
  })

  const searchParams = headerList.get('x-full-search-query-params') || ''
  const urlSearchParams = new URLSearchParams(searchParams)
  urlSearchParams.set('statusUpdated', `${record_status}`)
  redirect(`${pathName}?${urlSearchParams}`)
}

export { handleChangeStatus }
