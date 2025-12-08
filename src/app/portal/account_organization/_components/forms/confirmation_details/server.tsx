import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import ConfirmationSummary from './custom/ConfirmationSummary'

const FormServerFetch = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, , identifier, current_step] = pathname.split('/')
  const record = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'code', 'categories'],
  })
  const accountRecord = record?.data

  if (accountRecord?.categories?.[0] !== 'External User' && current_step === '3') return null

  return (
    <div className='space-y-2'>
      <ConfirmationSummary />
    </div>
  )
}

export default FormServerFetch
