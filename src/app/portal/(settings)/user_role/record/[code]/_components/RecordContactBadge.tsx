'use client'

import { useContext } from 'react';
import { api } from '~/trpc/react';
import { testIDFormatter } from '~/utils/formatter';
import useRefetchRecord from '../_record_summary/hooks/useFetchMainRecord';
import { Badge } from '~/components/ui/badge';

interface IProps {
  form_key: string
  identifier: string
  main_entity: string
}

const RecordContactBadge = ({form_key, identifier, main_entity}: IProps) => {
  const queryResult = api.record.getByCode.useQuery({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'categories'],
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

  const categories = (data as { [key: string]: any })?.categories

  return (
    <div data-test-id={testIDFormatter('rcrd-sum-details-categories')}>
      <div className="inline-flex gap-2 text-sm flex-wrap">
        <span>
          {categories?.length
            ? categories.map((item: string) => (
                <Badge
                  key={item}
                  variant={'primary'}
                >
                  {item}
                </Badge>
              ))
            : 'None'}
        </span>
      </div>
    </div>
  );
}

export default RecordContactBadge;