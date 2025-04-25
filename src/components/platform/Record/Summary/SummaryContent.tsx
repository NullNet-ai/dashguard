import { cookies, headers } from 'next/headers'
import React from 'react'

import { api } from '~/trpc/server'

import SummaryClientContent from './SummaryClientContent'

const RecordSummaryContent = async () => {
  const headerList = headers()

  const username = cookies().get('username')?.value || ''
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, , identifier] = pathname.split('/')

  const recordDetails = await api.record.getByCodeWithJoin({
    id: identifier!,
    pluck_fields: [
      'id',
      'code',
      'status',
      'created_date',
      'created_time',
      'updated_date',
      'updated_time',
      'categories',
      'updated_by',
      'image_url',
    ],
    main_entity: mainEntity!,
  })

  const token = await api.auth.getToken({
    username: username,
  })
  

  if (recordDetails?.status_code === 500) {
    throw recordDetails.message
  }

  return (
      <SummaryClientContent recordDetails={recordDetails} mainEntity={mainEntity}  token={token}/>
  )
};

export default RecordSummaryContent
