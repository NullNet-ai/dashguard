import { headers } from 'next/headers'
import { api } from '~/trpc/server'
import DeviceLocation from './client'

const FormServerFetch = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')

  const fetched_device = await api.device.fetchDeviceInfo({
    code: identifier!,
  });

  return (
    <div className="space-y-2">
      <DeviceLocation
        // @ts-expect-error - No type yet
        defaultValues={{
          ...fetched_device,
          address_city: fetched_device?.address?.city || '',
          address_country: fetched_device?.address?.country || '',
          address_state: fetched_device?.address?.state || '',
        } ?? {}}
        params={{
          // @ts-expect-error - No type yet
          id: fetched_device?.id as string,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
      />
    </div>
  )
}

export default FormServerFetch
