import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import SetupDetails from './client'

const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const fetched_device = application === 'wizard'
    ? await api.device.getSetupDetails({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ['id', 'code'],
    })
    : await api.device.getByCode({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ['id', 'code'],
    })
  const defaultValues = fetched_device?.data

  return (
    <SetupDetails
      defaultValues={defaultValues || {}}
      params={{
        id: defaultValues?.id! ?? '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  )
}

export default FormServerFetch
