import { cookies, headers } from 'next/headers'
import React from 'react'

import { Separator } from '~/components/ui/separator'
import { api } from '~/trpc/server'

import IdentifierComponent from './Header/IdentifierComponent'
import ProfileImage from './Header/ProfileImage'
import SummaryRecordTab from './Header/SummaryTab'
import SystemDates from './Header/SystemDate'

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
      'first_name',
      'last_name',
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
    <div>
      {/* <Separator /> */}
      <IdentifierComponent
        code={recordDetails?.data?.code!}
        status={recordDetails?.data?.status!}
      />
      <SummaryRecordTab />
      <ProfileImage details={recordDetails} entity={mainEntity} token={token}/>
      <SystemDates
        created_date={recordDetails?.data?.created_date!}
        created_time={recordDetails?.data?.created_time!}
        updated_date={recordDetails?.data?.updated_date!}
        updated_time={recordDetails?.data?.updated_time!}
        created_by_first_name={
          recordDetails?.data?.created_by_data?.first_name || ''
        }
        created_by_last_name={
          recordDetails?.data?.created_by_data?.last_name || ''
        }
        updated_by_first_name={
          recordDetails?.data?.updated_by_data?.first_name || ''
        }
        updated_by_last_name={
          recordDetails?.data?.updated_by_data?.last_name || ''
        }
      />
      <Separator />
    </div>
  )
};

export default RecordSummaryContent
