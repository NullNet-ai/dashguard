'use client'

import { api } from '~/trpc/react'
import { useMemo } from 'react'

import useRefetchRecord from '../hooks/useFetchMainRecord'
import RecordDeviceLastHeartbeat from '../record_custom_query/RecordDeviceLastHeartbeat'
import RecordDeviceStatus from '../record_custom_query/RecordDeviceStatus'
import SummaryDetails from '~/components/platform/Record/Summary/SummaryDetails'

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string
  identifier: string
  main_entity: string
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.device.fetchRecordShellSummary.useQuery({
    code: identifier!,
  })

  const { data } = record ?? {}

  useRefetchRecord({
    refetch,
    form_key,
  })

  const deviceData = useMemo(() => {
    if (!data) return {}
    
    const interfacesArr = Array.isArray(data?.interfaces) ? data.interfaces : []
    const namedInterfaces = interfacesArr.reduce((acc: Record<string, string>, curr: any) => {
      const name = typeof curr?.name === 'string' ? curr.name.toLowerCase() : ''
      if (name) acc[name] = curr?.address ?? 'None'
      return acc
    }, {})

    return {
      ...data,
      type: data?.model,
      grouping: data?.grouping_name,
      version: data?.device_version,
      interfaces: interfacesArr,
      device_category: data?.device_category || 'None',
      ...namedInterfaces,
    }
  }, [data])

  if (error) {
    console.error("Error fetching record summary", error)
  }

  return (
    <SummaryDetails
      data={deviceData}
      config={[
        {
          header_title: "Device Details",
          items: [
            {
              key: "Name",
              value: "device_name",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Type",
              value: "device_type",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Status",
              value: "status",
              customValue: (data: any) => <RecordDeviceStatus device_id={data?.id} />
            },
            {
              key: "Last Heartbeat",
              value: "last_heartbeat",
              customValue: (data: any) => <RecordDeviceLastHeartbeat device_id={data?.id} />
            },
            {
              key: "Host Name",
              value: "hostname",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Wallguard Version",
              value: "version",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
          ]
        },
        {
          header_title: "Interfaces",
          scrollable: true,
          defaultVisibleCount: 3,
          items: [...deviceData.interfaces].sort((a: any, b: any) => {
            const order = ['wan', 'lan']
            const ai = order.indexOf(a?.name?.toLowerCase())
            const bi = order.indexOf(b?.name?.toLowerCase())
            if (ai !== -1 && bi !== -1) return ai - bi
            if (ai !== -1) return -1
            if (bi !== -1) return 1
            return (a?.name ?? '').localeCompare(b?.name ?? '', undefined, { numeric: true })
          }).map(e => ({
            key: e?.name?.toUpperCase(),
            value: e?.name,
            truncated: () => ({ string_limit: 35, path: ['value'] })
          }))
        },
      ]}
    />
  )
}

export default RecordShellSummary
