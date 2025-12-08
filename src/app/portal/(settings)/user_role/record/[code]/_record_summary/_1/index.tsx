'use client'
import React from 'react'
import StatusCell from '~/components/ui/status-cell'
import { api } from '~/trpc/react'
import useRefetchRecord from '../hooks/useFetchMainRecord'
import { CardComponent as Card } from '~/components/ui/card/index';
import { Separator } from '~/components/ui/separator'

const fields = {
  Role: 'role',
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
    <Card className='p-3'>
      <div className="flex flex-col gap-y-2">
        <div>
          <span className="text-md font-medium text-foreground">
            User Role Details
          </span>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          {Object.entries(fields).map(([key, value], index) => {
            const dataValue = (data as { [key: string]: any })?.[value]
            return (
              <div className='text-sm' key={index}>
                <div className="flex justify-between gap-2">
                  <span className='text-slate-400 whitespace-nowrap'>
                    {key}
                    {' '}
                  </span>
                  <span className='break-all text-slate-700'>
                    {key === 'Category'
                      ? (dataValue?.length
                        && dataValue.map((item: string) => {
                          return <StatusCell key={item} value={item} />
                        }))
                        || 'None'
                      : dataValue || 'None'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export default RecordShellSummary
