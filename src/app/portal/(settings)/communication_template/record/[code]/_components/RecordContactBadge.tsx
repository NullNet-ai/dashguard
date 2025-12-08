'use client'

import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { api } from '~/trpc/react'
import { testIDFormatter } from '~/utils/formatter'

import useRefetchRecord from '../_record_summary/hooks/useFetchMainRecord'
import ContentLoading from '../loading'

interface IProps {
  form_key: string
  identifier: string
  main_entity: string
}

const RecordContactBadge = ({ form_key, identifier, main_entity }: IProps) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
    isLoading,
    isError,
  } = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'categories', 'name', 'event'],
  })

  useRefetchRecord({
    refetch,
    form_key,
  })

  if (isLoading) {
    return <ContentLoading />
  }

  if (isError) {
    return (
      <Alert dismissible={true} variant="error">
        <AlertTitle>Error</AlertTitle>
        <AlertContent>{JSON.stringify(error)}</AlertContent>
      </Alert>
    )
  }

  return (
    <div data-test-id={testIDFormatter('rcrd-sum-details-categories')}>
      <div className='inline-flex flex-wrap gap-2 text-sm'>
        <Badge className='' variant="primary">
          {record?.data?.categories?.[0]}
        </Badge>
      </div>
    </div>
  )
}

export default RecordContactBadge
