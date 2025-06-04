import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import DeviceBasicDetails from './client'

const model_options = ['PfSense', 'OpenSense'].map(model => ({
  label: model,
  value: model,
}))

const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const fetched_device = await api.device.fetchBasicDetails({
    code: identifier!,
  })
  console.log("%c Line:17 🥝 fetched_device", "color:#7f2b82", fetched_device);

  const group_options = await api.deviceGroupSetting.getDeviceGroupSettings()

  const defaultValues = fetched_device?.data

  return (
    <div className="space-y-2">
      <DeviceBasicDetails
        defaultValues={defaultValues ?? {}}
        params={{
          id: defaultValues?.id as string,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
        selectOptions={{
          model: model_options,
          grouping: group_options,
        }}
      />
    </div>
  )
}

export default FormServerFetch
