/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import Confirmation from './client'
const WizardContainer = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')

  const response = await api.device.getByCode({
    id: identifier!,
    pluck_fields: ['id', 'status'],
    main_entity: main_entity!,
  })

  const defaultValues = { ...response?.data, id: response?.data?.id }

  return (
    <div className="space-y-2">
      <Confirmation
        defaultValues={defaultValues}
        params={{
          id: defaultValues?.id ?? '',
          shell_type: application! as 'record' | 'wizard',
        }}
      />
    </div>
  )
}

export default WizardContainer
