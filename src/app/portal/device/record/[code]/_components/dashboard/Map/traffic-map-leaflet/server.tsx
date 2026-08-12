import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import TrafficMaps from './client'

const FormServerFetch = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const fetched_device = await api.device.fetchDeviceInfo({
    code: identifier!,
  })

  const defaultValues = fetched_device

  return (
    <TrafficMaps
      defaultValues={defaultValues ?? {}}
      params={{
        // @ts-expect-error
        id: defaultValues?.id! ?? '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  )
}

export default FormServerFetch
