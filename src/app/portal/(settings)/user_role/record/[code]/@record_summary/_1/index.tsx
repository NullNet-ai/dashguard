'use client'
import React from 'react'

import StatusCell from '~/components/ui/status-cell'
import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const fields = {
  Name: 'role',
  Category: 'categories',
  Entity: 'entity',
}

const RecordShellSummary = ({
  form_key,
  identifier,
  main_entity,
}: {
  form_key: string
  identifier: string
  main_entity: string
}) => {
  const queryResult = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'role', 'categories', 'entity'],
  })

  const record = queryResult.data ?? { data: { id: null } }
  const data = record.data ?? {}
  const { error } = queryResult

  useRefetchRecord({
    refetch: queryResult.refetch,
    form_key,
  })

  if (error) {
    return (
      <div>
        Error:
        {error.message}
      </div>
    )
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value], index) => {
        const dataValue = (data as { [key: string]: any })?.[value]
        return (
          <div className="pt-2" key={index}>
            <div className="px-5">
              <div className="p-1 text-sm">
                <div>
                  <span className="text-slate-400">
                    {key}
                    :
                    {' '}
                  </span>
                  <span>
                    {key === 'Category'
                      ? (dataValue?.length && dataValue.map((item: string) => {
                          return <StatusCell key={item} value={item} />
                        })) || 'None'
                      : dataValue || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecordShellSummary
