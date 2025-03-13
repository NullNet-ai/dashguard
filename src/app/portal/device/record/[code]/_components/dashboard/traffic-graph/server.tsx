import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import TrafficGraph from './client'

const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const fetched_device = await api.record.getByCode({
    id: identifier!,
    pluck_fields: ['id', 'code', 'status', 'device_status'],
    main_entity: main_entity!,
  })

  const defaultValues = fetched_device?.data

  return (
    <TrafficGraph
      defaultValues={defaultValues ?? {}}
      params={{
        id: defaultValues?.id! ?? '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  )
}

export default FormServerFetch
