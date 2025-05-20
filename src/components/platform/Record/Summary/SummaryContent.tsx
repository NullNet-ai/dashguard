import { cookies, headers } from 'next/headers'
import React from 'react'
import { api } from '~/trpc/server'
import SummaryClientContent from './SummaryClientContent'

const RecordSummaryContent = async () => {
  try {
    const headerList = headers()
    const username = cookies().get('username')?.value || ''
    const pathname = headerList.get('x-pathname') || ''
    const mainEntity = headerList.get('x-main-entity') || '';
    const [, , , , identifier] = pathname.split('/')

    if (!identifier || !mainEntity) {
      throw new Error('Invalid URL parameters')
    }

    const [recordDetails, token] = await Promise.all([
      api.record.getByCodeWithJoin({
        id: identifier,
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
        main_entity: mainEntity,
      }),
      api.auth.getToken({
        username: username,
      })
    ]).catch((error) => {
      throw new Error(`Failed to fetch data: ${error.message}`)
    })

    if (recordDetails?.status_code === 500) {
      throw recordDetails.message
    }

    if (!recordDetails || !token) {
      throw new Error('Failed to fetch required data')
    }

    return (
      <SummaryClientContent 
        recordDetails={recordDetails} 
        mainEntity={mainEntity} 
        token={token}
      />
    )
  } catch (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </div>
      </div>
    )
  }
}

export default RecordSummaryContent