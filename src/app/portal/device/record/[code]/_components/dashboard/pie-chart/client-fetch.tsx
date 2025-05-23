"use client"
import { api } from '~/trpc/react'
import PieChartComponent from './client'
import { usePathname } from 'next/navigation'
import { IFormProps } from '../types'

const FormClientFetch = ({interfaces }: IFormProps) => {
  // const headerList = headers()
  // const pathname = headerList.get('x-pathname') || ''
  // const [, , main_entity, application, identifier] = pathname.split('/')
  const pathname = usePathname()
  const [, , main_entity, application, identifier] = pathname.split('/')

  //This is an unnecessary fetching of data ??
  const {data: fetched_device} = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ["id", "code", "status", "device_status"],
    main_entity: main_entity!,
  })

  const {
    data
  } = fetched_device?? {}
  const fetched_interfaces = api.deviceConfiguration.fetchInterfaceOptions.useQuery({
    code: identifier!,
})

  return (
    <PieChartComponent
    defaultValues={data ?? {}}
    interfaces={interfaces}
    selectOptions={fetched_interfaces?.data ?? []}
      params={{
        id: data?.id! ?? '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  )
}

export default FormClientFetch
