'use client'
import { usePathname } from 'next/navigation'

import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname()
  const [, , entity, _, identifier] = pathName.split('/')
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ['id', 'code', 'status'],
    main_entity: entity!,
  })

  useRefetchRecord({
    refetch,
    form_key,
  })

  if (error) {
    return (
      <div>
        {"Error:"}
        {error.message}
      </div>
    )
  }
  return null
}

const SummaryConfig = {
  label: 'Step 2',
  required: true,
  components: [
    {
      label: 'Confirmation',
      component: <Summary form_key='Confirmation' />,
    },
  ],
}

export default SummaryConfig
